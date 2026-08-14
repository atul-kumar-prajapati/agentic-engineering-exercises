import assert from "node:assert/strict";
import fs from "node:fs";
import { createLegacyCheckout } from "../src/checkout/legacyCheckout.mjs";
import { routeCheckout } from "../src/checkout/checkoutRouter.mjs";

let createCardCheckout;
try {
  ({ createCardCheckout } = await import("../src/checkout/cardCheckout.mjs"));
} catch {
  throw new Error("Create src/checkout/cardCheckout.mjs and export createCardCheckout");
}

const cases = JSON.parse(fs.readFileSync(new URL("../../docs/checkout-cases.json", import.meta.url), "utf8"));
for (const scenario of cases) {
  const legacyCalls = [];
  const cardCalls = [];
  const legacy = createLegacyCheckout({ authorize: async (request) => { legacyCalls.push(request); return scenario.authorization; } });
  const card = createCardCheckout({ authorize: async (request) => { cardCalls.push(request); return scenario.authorization; } });
  const legacyResult = await legacy(structuredClone(scenario.request));
  const cardResult = await card(structuredClone(scenario.request));
  assert.deepEqual(legacyResult, scenario.expected, `${scenario.name}: legacy fixture changed`);
  assert.deepEqual(cardResult, legacyResult, `${scenario.name}: card slice changed the public result`);
  assert.equal(legacyCalls.length, 1);
  assert.equal(cardCalls.length, 1);
  assert.deepEqual(cardCalls[0], {
    orderId: scenario.request.orderId,
    amountCents: scenario.expected.totalCents,
    paymentToken: scenario.request.paymentToken,
  });
}

function routingFakes(cardBehavior = async (request) => ({ orderId: request.orderId, status: "paid", totalCents: 1084, errorCode: null })) {
  const calls = { legacy: [], card: [] };
  return {
    calls,
    dependencies: {
      legacy: async (request) => { calls.legacy.push(request.paymentType); return { orderId: request.orderId, status: "paid", totalCents: 1084, errorCode: null }; },
      card: async (request) => { calls.card.push(request.paymentType); return cardBehavior(request); },
      cardSliceEnabled: true,
    },
  };
}
const request = { orderId: "ord-route", paymentType: "card", subtotalCents: 1001, taxRateBps: 825, paymentToken: "tok" };

const enabled = routingFakes();
assert.deepEqual(await routeCheckout(request, enabled.dependencies), { orderId: "ord-route", status: "paid", totalCents: 1084, errorCode: null });
assert.deepEqual(enabled.calls, { legacy: [], card: ["card"] });

for (const paymentType of ["gift-card", "invoice", "crypto"]) {
  const current = routingFakes();
  await routeCheckout({ ...request, paymentType }, current.dependencies);
  assert.deepEqual(current.calls, { legacy: [paymentType], card: [] }, `${paymentType} must remain legacy`);
}

const disabled = routingFakes();
disabled.dependencies.cardSliceEnabled = false;
await routeCheckout(request, disabled.dependencies);
assert.deepEqual(disabled.calls, { legacy: ["card"], card: [] }, "flag-off card must use legacy only");

const safe = routingFakes(async () => { throw { authorizationCreated: false }; });
await routeCheckout(request, safe.dependencies);
assert.deepEqual(safe.calls, { legacy: ["card"], card: ["card"] }, "pre-authorization failure may fall back exactly once");

const uncertainResult = { orderId: "ord-route", status: "failed", totalCents: 1084, errorCode: "PAYMENT_STATE_UNKNOWN" };
for (const failure of [
  { authorizationCreated: true, result: uncertainResult },
  { result: uncertainResult },
  new Error("gateway outcome unknown"),
]) {
  const unsafe = routingFakes(async () => { throw failure; });
  const result = await routeCheckout(request, unsafe.dependencies);
  assert.deepEqual(unsafe.calls, { legacy: [], card: ["card"] }, "unsafe failure must never retry legacy");
  assert.deepEqual(result, uncertainResult);
}

console.log("PASS 2 legacy comparisons and 8 protected strangler route checks");

import assert from "node:assert/strict";
import { createCardCheckout } from "./cardCheckout.mjs";
import { createLegacyCheckout } from "./legacyCheckout.mjs";
import { routeCheckout } from "./checkoutRouter.mjs";

function totalCents(request) {
  return request.subtotalCents + Math.round(request.subtotalCents * request.taxRateBps / 10000);
}

function routingBag(cardBehavior) {
  const calls = { legacy: [], card: [] };
  return {
    calls,
    implementations: {
      legacy: async (request) => {
        calls.legacy.push(request.paymentType);
        return { orderId: request.orderId, status: "paid", totalCents: totalCents(request), errorCode: null };
      },
      card: async (request) => {
        calls.card.push(request.paymentType);
        return cardBehavior(request);
      },
      cardSliceEnabled: true,
    },
  };
}

const approvedCard = {
  orderId: "ord-card-ok",
  paymentType: "card",
  subtotalCents: 1001,
  taxRateBps: 825,
  paymentToken: "tok-ok",
};

const paidCardResult = { orderId: "ord-card-ok", status: "paid", totalCents: 1084, errorCode: null };

const enabled = routingBag(async () => paidCardResult);
assert.deepEqual(await routeCheckout(approvedCard, enabled.implementations), paidCardResult);
assert.deepEqual(enabled.calls, { legacy: [], card: ["card"] });

for (const paymentType of ["gift-card", "invoice", "crypto"]) {
  const current = routingBag(async () => paidCardResult);
  await routeCheckout({ ...approvedCard, paymentType }, current.implementations);
  assert.deepEqual(current.calls, { legacy: [paymentType], card: [] }, `${paymentType} stays on legacy`);
}

const disabled = routingBag(async () => paidCardResult);
disabled.implementations.cardSliceEnabled = false;
await routeCheckout(approvedCard, disabled.implementations);
assert.deepEqual(disabled.calls, { legacy: ["card"], card: [] }, "flag-off card must use legacy only");

const preAuth = routingBag(async () => { throw { authorizationCreated: false }; });
await routeCheckout(approvedCard, preAuth.implementations);
assert.deepEqual(preAuth.calls, { legacy: ["card"], card: ["card"] }, "pre-authorization failure may fall back once");

const uncertainResult = { orderId: "ord-card-ok", status: "failed", totalCents: 1084, errorCode: "PAYMENT_STATE_UNKNOWN" };
for (const failure of [
  { authorizationCreated: true, result: uncertainResult },
  { result: uncertainResult },
  new Error("gateway outcome unknown"),
]) {
  const unsafe = routingBag(async () => { throw failure; });
  const result = await routeCheckout(approvedCard, unsafe.implementations);
  assert.deepEqual(unsafe.calls, { legacy: [], card: ["card"] }, "unsafe failure must never retry legacy");
  assert.deepEqual(result, uncertainResult);
}

const declinedAuthorize = async () => ({ approved: false });
const card = createCardCheckout({ authorize: declinedAuthorize });
const legacy = createLegacyCheckout({ authorize: declinedAuthorize });
const declinedRequest = { orderId: "ord-card-no", paymentType: "card", subtotalCents: 4200, taxRateBps: 500, paymentToken: "tok-no" };
assert.deepEqual(await card(declinedRequest), await legacy(declinedRequest));
assert.equal((await card(declinedRequest)).errorCode, "PAYMENT_DECLINED");

console.log("PASS checkoutRouter participant checks");

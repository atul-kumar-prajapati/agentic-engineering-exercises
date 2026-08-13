import assert from "node:assert/strict";
import { routeCheckout } from "../src/checkout/checkoutRouter.mjs";

function fakes() {
  const calls = { legacy: [], card: [] };
  return { calls, implementations: {
    async legacy(request) { calls.legacy.push(request.paymentType); return { orderId: request.orderId, status: "paid", totalCents: 4200, errorCode: null }; },
    async card(request) { calls.card.push(request.paymentType); return { orderId: request.orderId, status: "paid", totalCents: 4200, errorCode: null }; },
  } };
}
for (const paymentType of ["gift-card", "invoice"]) {
  const current = fakes();
  await routeCheckout({ orderId: `ord-${paymentType}`, paymentType }, current.implementations);
  assert.deepEqual(current.calls.legacy, [paymentType], `${paymentType} must remain on legacy`);
  assert.deepEqual(current.calls.card, [], `${paymentType} must not call the card slice`);
}
const card = fakes();
const result = await routeCheckout({ orderId: "ord-card", paymentType: "card" }, card.implementations);
assert.deepEqual(card.calls.card, ["card"], "card must use the new slice");
assert.deepEqual(card.calls.legacy, [], "successful card path must not use legacy");
assert.deepEqual(result, { orderId: "ord-card", status: "paid", totalCents: 4200, errorCode: null });
console.log("Card uses the strangler slice while gift-card and invoice remain legacy.");

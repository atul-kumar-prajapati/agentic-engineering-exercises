import assert from "node:assert/strict";
import { declinedCard } from "../src/payment/paymentFixtures";
import { runPaymentScenario } from "../src/payment/paymentOrchestrator";

const checks: Array<[string, () => void]> = [
  ["approved authorization is captured", () => {
    const payment = runPaymentScenario();
    assert.equal(payment.order.status, "paid");
    assert.equal(payment.intent.status, "captured");
    assert.equal(payment.authorization?.status, "approved");
    assert.equal(payment.capture?.status, "settled");
  }],
  ["approved payment writes authorization and capture ledger entries", () => {
    const payment = runPaymentScenario();
    assert.deepEqual(payment.ledgerEntries.map((entry) => entry.type), ["authorization_hold", "capture"]);
    assert.equal(payment.receipt.status, "sent");
    assert.equal(payment.webhookEvents[0]?.type, "payment.captured");
  }],
  ["declined authorization does not capture", () => {
    const payment = runPaymentScenario(declinedCard);
    assert.equal(payment.order.status, "payment_failed");
    assert.equal(payment.intent.status, "declined");
    assert.equal(payment.capture, undefined);
  }],
  ["declined payment records failure and blocks receipt", () => {
    const payment = runPaymentScenario(declinedCard);
    assert.deepEqual(payment.ledgerEntries.map((entry) => entry.type), ["payment_failed"]);
    assert.equal(payment.receipt.status, "blocked");
    assert.equal(payment.webhookEvents[0]?.type, "payment.declined");
  }],
];

let failed = 0;
for (const [name, check] of checks) {
  try { check(); console.log(`PASS ${name}`); }
  catch (error) { failed += 1; console.error(`FAIL ${name}: ${(error as Error).message}`); }
}
if (failed) process.exit(1);

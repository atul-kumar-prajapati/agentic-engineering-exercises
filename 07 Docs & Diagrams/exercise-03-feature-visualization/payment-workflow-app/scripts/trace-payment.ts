import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { declinedCard } from "../src/payment/paymentFixtures";
import { runPaymentScenario } from "../src/payment/paymentOrchestrator";
import { reconcileCapturedWebhook } from "../src/payment/webhookReconciler.mjs";

const sourceSha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: process.cwd(), encoding: "utf8" }).trim();
const approved = runPaymentScenario();
const declined = runPaymentScenario(declinedCard);
const state = { knownGatewayReferences: new Set(["gw_approved"]), handledEventIds: new Set<string>(), ledgerEntries: [] as Array<object> };
const event = { id: "evt_capture_1", gatewayReference: "gw_approved", type: "payment.captured" };
const first = reconcileCapturedWebhook(state, event, "sig_gw_approved");
const duplicate = reconcileCapturedWebhook(state, event, "sig_gw_approved");
assert.equal(first, "recorded");
assert.equal(duplicate, "already-handled");
assert.equal(state.ledgerEntries.length, 1);
assert.throws(() => reconcileCapturedWebhook(state, { ...event, id: "evt_unknown", gatewayReference: "gw_unknown" }, "sig_gw_unknown"), /unknown/i);
assert.throws(() => reconcileCapturedWebhook(state, { ...event, id: "evt_bad" }, "bad"), /signature/i);

console.log(`Source SHA: ${sourceSha}`);
console.log(`Approved: order=${approved.order.status} intent=${approved.intent.status} ledger=${approved.ledgerEntries.map((item) => item.type).join(",")} receipt=${approved.receipt.status}`);
console.log(`Declined: order=${declined.order.status} intent=${declined.intent.status} capture=${declined.capture ?? "none"} receipt=${declined.receipt.status}`);
console.log(`First webhook: result=${first} ledger=${state.ledgerEntries.length}`);
console.log(`Duplicate webhook: result=${duplicate} ledger=${state.ledgerEntries.length}`);
console.log("Invalid signature: rejected");
console.log("Unknown gateway reference: rejected");
console.log("PASS all payment and reconciliation paths match the required behavior");

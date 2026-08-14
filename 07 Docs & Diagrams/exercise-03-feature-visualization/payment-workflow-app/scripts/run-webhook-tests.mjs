import assert from "node:assert/strict";
import { reconcileCapturedWebhook } from "../src/payment/webhookReconciler.mjs";

function state() {
  return { knownGatewayReferences: new Set(["gw_approved"]), handledEventIds: new Set(), ledgerEntries: [] };
}

const event = { id: "evt_capture_1", gatewayReference: "gw_approved", type: "payment.captured" };
const checks = [
  ["valid event records one capture and marks the event handled", () => {
    const current = state();
    assert.equal(reconcileCapturedWebhook(current, event, "sig_gw_approved"), "recorded");
    assert.deepEqual(current.ledgerEntries, [{ eventId: "evt_capture_1", gatewayReference: "gw_approved", type: "capture" }]);
    assert.equal(current.handledEventIds.has(event.id), true);
  }],
  ["invalid signature is rejected before state access", () => {
    const guarded = {
      get knownGatewayReferences() { throw new Error("known references were read"); },
      get handledEventIds() { throw new Error("handled IDs were read"); },
      get ledgerEntries() { throw new Error("ledger was read"); },
    };
    assert.throws(() => reconcileCapturedWebhook(guarded, event, "bad"), /signature/i);
  }],
  ["unknown gateway reference is rejected without mutation", () => {
    const current = state();
    const unknown = { ...event, id: "evt_unknown", gatewayReference: "gw_unknown" };
    assert.throws(() => reconcileCapturedWebhook(current, unknown, "sig_gw_unknown"), /unknown/i);
    assert.equal(current.ledgerEntries.length, 0);
    assert.equal(current.handledEventIds.size, 0);
  }],
  ["reference ownership is checked before duplicate status", () => {
    const current = state();
    current.handledEventIds.add("evt_unknown");
    const unknown = { ...event, id: "evt_unknown", gatewayReference: "gw_unknown" };
    assert.throws(() => reconcileCapturedWebhook(current, unknown, "sig_gw_unknown"), /unknown/i);
    assert.equal(current.ledgerEntries.length, 0);
  }],
  ["duplicate event is idempotent", () => {
    const current = state();
    reconcileCapturedWebhook(current, event, "sig_gw_approved");
    assert.equal(reconcileCapturedWebhook(current, event, "sig_gw_approved"), "already-handled");
    assert.equal(current.ledgerEntries.length, 1);
  }],
];

let failed = 0;
for (const [name, check] of checks) {
  try { check(); console.log(`PASS ${name}`); }
  catch (error) { failed += 1; console.error(`FAIL ${name}: ${error.message}`); }
}
if (failed) process.exit(1);

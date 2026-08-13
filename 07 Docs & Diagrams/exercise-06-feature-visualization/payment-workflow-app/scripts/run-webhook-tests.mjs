import assert from "node:assert/strict";
import { reconcileCapturedWebhook } from "../src/payment/webhookReconciler.mjs";

function state() { return { knownGatewayReferences: new Set(["gw_approved"]), handledEventIds: new Set(), ledgerEntries: [] }; }
const event = { id: "evt_capture_1", gatewayReference: "gw_approved", type: "payment.captured" };
const checks = [
  ["valid event records one capture", () => { const current = state(); assert.equal(reconcileCapturedWebhook(current, event, "sig_gw_approved"), "recorded"); assert.equal(current.ledgerEntries.length, 1); }],
  ["invalid signature is rejected", () => assert.throws(() => reconcileCapturedWebhook(state(), event, "bad"), /signature/i)],
  ["duplicate event is idempotent", () => { const current = state(); reconcileCapturedWebhook(current, event, "sig_gw_approved"); assert.equal(reconcileCapturedWebhook(current, event, "sig_gw_approved"), "already-handled"); assert.equal(current.ledgerEntries.length, 1); }],
  ["unknown gateway reference is rejected", () => assert.throws(() => reconcileCapturedWebhook(state(), { ...event, id: "evt_unknown", gatewayReference: "gw_unknown" }, "sig_gw_unknown"), /unknown/i)],
];
let failed = 0;
for (const [name, check] of checks) { try { check(); console.log(`PASS ${name}`); } catch (error) { failed += 1; console.error(`FAIL ${name}: ${error.message}`); } }
if (failed) process.exit(1);

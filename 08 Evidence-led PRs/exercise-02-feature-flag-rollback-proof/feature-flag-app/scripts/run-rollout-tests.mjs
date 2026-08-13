import assert from "node:assert/strict";
import { loadInvoiceExperience } from "../src/rollout/invoicePreview.mjs";

function dependencies() {
  const calls = { api: 0, telemetry: [] };
  return { calls, api: { async loadPreview() { calls.api += 1; return { total: 42 }; } }, telemetry: { emit(name) { calls.telemetry.push(name); } } };
}
const context = { targetingKey: "acct-100", accountId: "acct-100" };
const checks = [
  ["enabled state calls preview and emits preview telemetry", async () => { const d = dependencies(); const value = await loadInvoiceExperience({ enabled: true, evaluationError: false, context, ...d }); assert.equal(value.experience, "preview"); assert.equal(d.calls.api, 1); assert.deepEqual(d.calls.telemetry, ["invoice_preview_viewed"]); }],
  ["disabled state stays on legacy without new side effects", async () => { const d = dependencies(); const value = await loadInvoiceExperience({ enabled: false, evaluationError: false, context, ...d }); assert.deepEqual(value, { experience: "legacy" }); assert.equal(d.calls.api, 0); assert.deepEqual(d.calls.telemetry, []); }],
  ["evaluation error fails closed", async () => { const d = dependencies(); const value = await loadInvoiceExperience({ enabled: true, evaluationError: true, context, ...d }); assert.deepEqual(value, { experience: "legacy" }); assert.equal(d.calls.api, 0); assert.deepEqual(d.calls.telemetry, []); }],
];
let failed = 0;
for (const [name, check] of checks) { try { await check(); console.log(`PASS ${name}`); } catch (error) { failed += 1; console.error(`FAIL ${name}: ${error.message}`); } }
if (failed) process.exit(1);

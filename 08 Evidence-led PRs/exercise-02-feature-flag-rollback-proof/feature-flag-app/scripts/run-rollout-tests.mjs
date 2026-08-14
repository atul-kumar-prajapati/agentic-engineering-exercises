import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { executeScenario } from "./rollout-harness.mjs";

const config = JSON.parse(fs.readFileSync(path.resolve("config/invoice-preview.json"), "utf8"));
const context = { targetingKey: "acct-100", accountId: "acct-100" };
const checks = [
  ["enabled state evaluates safely and emits after one successful API call", async () => {
    const result = await executeScenario({ config, context });
    assert.deepEqual(result.outcome, { experience: "preview", preview: { accountId: "acct-100", total: 42, currency: "USD" } });
    assert.deepEqual(result.observations.evaluations, [{ flagKey: "invoice-preview-v2", defaultValue: false, context }]);
    assert.deepEqual(result.observations.apiCalls, [{ accountId: "acct-100" }]);
    assert.deepEqual(result.observations.telemetry, [{ name: "invoice_preview_viewed", attributes: { targetingKey: "acct-100", accountId: "acct-100", flagKey: "invoice-preview-v2" } }]);
  }],
  ["disabled target stays legacy with no preview side effects", async () => {
    const disabledContext = { targetingKey: "acct-999", accountId: "acct-999" };
    const result = await executeScenario({ config, context: disabledContext });
    assert.deepEqual(result.outcome, { experience: "legacy", reason: "flag-disabled" });
    assert.deepEqual(result.observations.evaluations, [{ flagKey: "invoice-preview-v2", defaultValue: false, context: disabledContext }]);
    assert.deepEqual(result.observations.apiCalls, []);
    assert.deepEqual(result.observations.telemetry, []);
  }],
  ["provider error fails closed with no preview side effects", async () => {
    const result = await executeScenario({ config, context, providerError: true });
    assert.deepEqual(result.outcome, { experience: "legacy", reason: "flag-evaluation-error" });
    assert.equal(result.observations.evaluations.length, 1);
    assert.deepEqual(result.observations.apiCalls, []);
    assert.deepEqual(result.observations.telemetry, []);
  }],
  ["mismatched targeting context is rejected before evaluation", async () => {
    const result = await executeScenario({ config, context: { targetingKey: "acct-100", accountId: "acct-200" } });
    assert.deepEqual(result.outcome, { experience: "legacy", reason: "invalid-context" });
    assert.deepEqual(result.observations, { evaluations: [], apiCalls: [], telemetry: [] });
  }],
  ["empty targeting context is rejected before evaluation", async () => {
    const result = await executeScenario({ config, context: { targetingKey: "", accountId: "" } });
    assert.deepEqual(result.outcome, { experience: "legacy", reason: "invalid-context" });
    assert.deepEqual(result.observations, { evaluations: [], apiCalls: [], telemetry: [] });
  }],
  ["preview API error returns legacy without success telemetry", async () => {
    const result = await executeScenario({ config, context, apiError: true });
    assert.deepEqual(result.outcome, { experience: "legacy", reason: "preview-unavailable" });
    assert.equal(result.observations.evaluations.length, 1);
    assert.deepEqual(result.observations.apiCalls, [{ accountId: "acct-100" }]);
    assert.deepEqual(result.observations.telemetry, []);
  }],
];

let failed = 0;
for (const [name, check] of checks) {
  try { await check(); console.log(`PASS ${name}`); }
  catch (error) { failed += 1; console.error(`FAIL ${name}: ${error.message}`); }
}
if (failed) process.exit(1);

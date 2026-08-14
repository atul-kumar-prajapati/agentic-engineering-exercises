import assert from "node:assert/strict";
import crypto from "node:crypto";
import { verifyRollbackDocument, verifyRollbackMarkdown, verifyRollbackScriptSource, verifyScenarioDocument } from "./rollout-verification.mjs";

const sha = "a".repeat(40);
const digest = "b".repeat(64);
const base = {
  schemaVersion: 1,
  sourceSha: sha,
  flagKey: "invoice-preview-v2",
  configSha256: digest,
  result: "passed",
};
const enabled = {
  ...base,
  scenario: "enabled",
  context: { targetingKey: "acct-100", accountId: "acct-100" },
  evaluation: [{ flagKey: "invoice-preview-v2", defaultValue: false, context: { targetingKey: "acct-100", accountId: "acct-100" } }],
  outcome: { experience: "preview", preview: { accountId: "acct-100", total: 42, currency: "USD" } },
  apiCalls: [{ accountId: "acct-100" }],
  telemetry: [{ name: "invoice_preview_viewed", attributes: { targetingKey: "acct-100", accountId: "acct-100", flagKey: "invoice-preview-v2" } }],
};
const disabled = {
  ...base,
  scenario: "disabled",
  context: { targetingKey: "acct-999", accountId: "acct-999" },
  evaluation: [{ flagKey: "invoice-preview-v2", defaultValue: false, context: { targetingKey: "acct-999", accountId: "acct-999" } }],
  outcome: { experience: "legacy", reason: "flag-disabled" },
  apiCalls: [], telemetry: [],
};
assert.deepEqual(verifyScenarioDocument(enabled, "enabled", sha, digest), []);
assert.deepEqual(verifyScenarioDocument(disabled, "disabled", sha, digest), []);
const tampered = structuredClone(disabled); tampered.apiCalls.push({ accountId: "acct-999" });
assert.ok(verifyScenarioDocument(tampered, "disabled", sha, digest).some((failure) => failure.includes("API call count")));
const wrongTarget = structuredClone(enabled); wrongTarget.apiCalls[0].accountId = "acct-200";
assert.ok(verifyScenarioDocument(wrongTarget, "enabled", sha, digest).some((failure) => failure.includes("API call targeting")));

const config = { schemaVersion: 1, flagKey: "invoice-preview-v2", enabled: true, allowlist: ["acct-100"], revision: "rollout-1" };
const configAfter = { ...config, enabled: false, allowlist: [], revision: "rollback-2026-08-14T10-30-00-000Z", lastRollback: { actor: "release-engineer", reason: "Invoice preview error rate exceeded rollback threshold", timestamp: "2026-08-14T10:30:00.000Z", previousRevision: "rollout-1" } };
const rollback = {
  schemaVersion: 1, sourceSha: sha,
  command: "node scripts/rollback-invoice-preview.mjs --config <temporary-config>",
  actor: "release-engineer", reason: "Invoice preview error rate exceeded rollback threshold", timestamp: "2026-08-14T10:30:00.000Z",
  startTime: "2026-08-14T10:30:00.000Z", endTime: "2026-08-14T10:30:00.050Z", elapsedMs: 50,
  configBeforeSha256: digest, configAfterSha256: crypto.createHash("sha256").update(`${JSON.stringify(configAfter, null, 2)}\n`).digest("hex"), configBefore: config,
  configAfter,
  behaviorBefore: { outcome: { experience: "preview" }, apiCalls: [{}], telemetry: [{}] },
  behaviorAfter: { outcome: { experience: "legacy", reason: "flag-disabled" }, apiCalls: [], telemetry: [] },
  invalidInputCheck: { rejected: true, configUnchanged: true },
  result: "passed", remainingCleanup: "Remove the flag and preview telemetry after rollout retirement approval.",
};
assert.deepEqual(verifyRollbackDocument(rollback, sha, config, digest), []);
const markdown = ["Source SHA", sha, rollback.command, "Start time", rollback.startTime, "End time", rollback.endTime, "Elapsed", String(rollback.elapsedMs), "Flag: enabled", "Experience: preview", "API calls: 1", "Telemetry events: 1", "Flag: disabled", "Target allowlist: empty", "Experience: legacy", "API calls: 0", "Telemetry events: 0", config.revision, rollback.configAfter.revision, "Result: PASS", "Invalid-input check: PASS", "Remaining cleanup", rollback.remainingCleanup].join("\n");
assert.deepEqual(verifyRollbackMarkdown(markdown, rollback), []);
const slow = structuredClone(rollback); slow.elapsedMs = 1001;
assert.ok(verifyRollbackDocument(slow, sha, config, digest).some((failure) => failure.includes("elapsed time")));
assert.deepEqual(verifyRollbackScriptSource("path.dirname(configPath); fs.writeFileSync(tempPath, json); fs.renameSync(tempPath, configPath); const lastRollback = { previousRevision };"), []);
assert.ok(verifyRollbackScriptSource("fs.writeFileSync(configPath, json);").some((failure) => failure.includes("atomically rename")));
console.log("rollout proof verifier self-test passed");

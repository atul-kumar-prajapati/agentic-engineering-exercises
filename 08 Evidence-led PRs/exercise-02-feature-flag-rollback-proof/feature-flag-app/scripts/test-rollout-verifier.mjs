import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
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
  interruptionCheck: { rejected: true, configUnchanged: true, temporaryFilesRemaining: 0, exclusiveLockObserved: true, revisionRecheckObserved: true, temporaryWriteObserved: true, renameObserved: false },
  atomicProtocol: { exclusiveLockObserved: true, revisionRecheckObserved: true, temporaryWriteObserved: true, renameObserved: true },
  concurrencyCheck: { successfulCommands: 1, rejectedCommands: 1, exitCodes: [0, 1], validConfig: true },
  result: "passed", remainingCleanup: "Remove the flag and preview telemetry after rollout retirement approval.",
};
assert.deepEqual(verifyRollbackDocument(rollback, sha, config, digest), []);
const markdown = ["Source SHA", sha, rollback.command, "Start time", rollback.startTime, "End time", rollback.endTime, "Elapsed", String(rollback.elapsedMs), "Flag: enabled", "Experience: preview", "API calls: 1", "Telemetry events: 1", "Flag: disabled", "Target allowlist: empty", "Experience: legacy", "API calls: 0", "Telemetry events: 0", config.revision, rollback.configAfter.revision, "Result: PASS", "Invalid-input check: PASS", "Interrupted update: PASS", "Concurrent rollback: PASS", "Remaining cleanup", rollback.remainingCleanup].join("\n");
assert.deepEqual(verifyRollbackMarkdown(markdown, rollback), []);
const slow = structuredClone(rollback); slow.elapsedMs = 1001;
assert.ok(verifyRollbackDocument(slow, sha, config, digest).some((failure) => failure.includes("elapsed time")));
assert.ok(verifyRollbackScriptSource("fs.writeFileSync(configPath, json);").some((failure) => failure.includes("atomically rename")));

const traceTemporary = fs.mkdtempSync(path.join(os.tmpdir(), "rollback-trace-self-test-"));
try {
  const configPath = path.join(traceTemporary, "config.json");
  const tracePath = path.join(traceTemporary, "trace.jsonl");
  const fixturePath = path.join(traceTemporary, "atomic-fixture.mjs");
  fs.writeFileSync(configPath, `${JSON.stringify(config)}\n`);
  fs.writeFileSync(fixturePath, `import fs from "node:fs";
const configPath = process.argv[2];
const lockPath = configPath + ".lock";
let descriptor;
let temporaryPath;
try {
  descriptor = fs.openSync(lockPath, fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_WRONLY);
  const current = JSON.parse(fs.readFileSync(configPath, "utf8"));
  temporaryPath = configPath + "." + process.pid + ".tmp";
  fs.writeFileSync(temporaryPath, JSON.stringify({ ...current, enabled: false }) + "\\n");
  fs.renameSync(temporaryPath, configPath);
} finally {
  if (descriptor !== undefined) fs.closeSync(descriptor);
  if (fs.existsSync(lockPath)) fs.unlinkSync(lockPath);
}
`);
  const preload = pathToFileURL(path.resolve(import.meta.dirname, "fs-rollback-trace-preload.mjs")).href;
  const traced = spawnSync(process.execPath, [fixturePath, configPath], {
    encoding: "utf8",
    env: {
      ...process.env,
      NODE_OPTIONS: [process.env.NODE_OPTIONS, `--import=${preload}`].filter(Boolean).join(" "),
      ROLLBACK_TRACE_CONFIG: configPath,
      ROLLBACK_TRACE_OUTPUT: tracePath,
    },
  });
  assert.equal(traced.status, 0, traced.stderr || traced.stdout);
  const trace = fs.readFileSync(tracePath, "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line));
  const lockIndex = trace.findIndex((item) => item.operation === "open" && item.path === `${configPath}.lock` && item.exclusive === true);
  const readIndex = trace.findIndex((item, index) => index > lockIndex && item.operation === "read" && item.path === configPath);
  const writeIndex = trace.findIndex((item, index) => index > readIndex && item.operation === "write" && item.path !== configPath);
  const renameIndex = trace.findIndex((item, index) => index > writeIndex && item.operation === "rename" && item.to === configPath);
  assert.ok(lockIndex >= 0 && readIndex > lockIndex && writeIndex > readIndex && renameIndex > writeIndex, "filesystem preload did not observe the atomic protocol");
  assert.equal(trace.some((item) => item.operation === "write" && item.path === configPath), false);

  const drillApp = path.join(traceTemporary, "drill-app");
  fs.mkdirSync(path.join(drillApp, "scripts"), { recursive: true });
  fs.mkdirSync(path.join(drillApp, "config"), { recursive: true });
  fs.mkdirSync(path.join(drillApp, "src", "rollout"), { recursive: true });
  for (const script of ["run-rollback-drill.mjs", "fs-rollback-trace-preload.mjs", "rollout-harness.mjs"]) {
    fs.copyFileSync(path.resolve(import.meta.dirname, script), path.join(drillApp, "scripts", script));
  }
  fs.copyFileSync(path.resolve(import.meta.dirname, "..", "config", "invoice-preview.json"), path.join(drillApp, "config", "invoice-preview.json"));
  fs.copyFileSync(path.resolve(import.meta.dirname, "..", "src", "rollout", "configFlagClient.mjs"), path.join(drillApp, "src", "rollout", "configFlagClient.mjs"));
  fs.writeFileSync(path.join(drillApp, "src", "rollout", "invoicePreview.mjs"), `export async function loadInvoiceExperience({ flagClient, context, api, telemetry }) {
  if (!context?.targetingKey || context.targetingKey !== context.accountId) return { experience: "legacy", reason: "invalid-context" };
  let enabled;
  try { enabled = await flagClient.getBooleanValue("invoice-preview-v2", false, context); }
  catch { return { experience: "legacy", reason: "flag-evaluation-error" }; }
  if (!enabled) return { experience: "legacy", reason: "flag-disabled" };
  try {
    const preview = await api.loadPreview(context.accountId);
    telemetry.emit("invoice_preview_viewed", { targetingKey: context.targetingKey, accountId: context.accountId, flagKey: "invoice-preview-v2" });
    return { experience: "preview", preview };
  } catch { return { experience: "legacy", reason: "preview-unavailable" }; }
}
`);
  fs.writeFileSync(path.join(drillApp, "scripts", "rollback-invoice-preview.mjs"), `import fs from "node:fs";
import path from "node:path";
const value = (name) => process.argv[process.argv.indexOf(name) + 1];
const configPath = path.resolve(value("--config"));
const actor = value("--actor");
const reason = value("--reason");
const timestamp = value("--timestamp");
const expectedRevision = value("--expected-revision");
const initialBytes = fs.readFileSync(configPath);
const initial = JSON.parse(initialBytes);
if (initial.schemaVersion !== 1 || initial.flagKey !== "invoice-preview-v2" || !actor?.trim() || !reason?.trim() || Number.isNaN(Date.parse(timestamp)) || initial.revision !== expectedRevision) throw new Error("invalid rollback input");
const lockPath = configPath + ".lock";
const temporaryPath = configPath + "." + process.pid + ".tmp";
let lock;
try {
  lock = fs.openSync(lockPath, "wx");
  const current = JSON.parse(fs.readFileSync(configPath, "utf8"));
  if (current.revision !== expectedRevision) throw new Error("stale revision");
  const next = { ...current, enabled: false, allowlist: [], revision: "rollback-" + timestamp.replace(/[:.]/g, "-"), lastRollback: { actor, reason, timestamp, previousRevision: current.revision } };
  fs.writeFileSync(temporaryPath, JSON.stringify(next, null, 2) + "\\n", { flag: "wx" });
  if (process.env.NODE_ENV === "test" && process.env.ROLLBACK_TEST_FAIL_BEFORE_RENAME === "1") throw new Error("injected failure");
  fs.renameSync(temporaryPath, configPath);
} finally {
  if (lock !== undefined) fs.closeSync(lock);
  if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
  if (fs.existsSync(lockPath)) fs.unlinkSync(lockPath);
}
`);
  const drill = spawnSync(process.execPath, [
    path.join(drillApp, "scripts", "run-rollback-drill.mjs"),
    "--sha", "a".repeat(40),
    "--json", path.join(drillApp, "rollback.json"),
    "--markdown", path.join(drillApp, "rollback.md"),
  ], { cwd: drillApp, encoding: "utf8" });
  assert.equal(drill.status, 0, drill.stderr || drill.stdout);
  const drillEvidence = JSON.parse(fs.readFileSync(path.join(drillApp, "rollback.json"), "utf8"));
  assert.deepEqual(drillEvidence.atomicProtocol, { exclusiveLockObserved: true, revisionRecheckObserved: true, temporaryWriteObserved: true, renameObserved: true });
  assert.equal(drillEvidence.interruptionCheck.temporaryWriteObserved, true);
  assert.equal(drillEvidence.concurrencyCheck.exitCodes.filter((code) => code === 0).length, 1);
} finally {
  fs.rmSync(traceTemporary, { recursive: true, force: true });
}
console.log("rollout proof verifier self-test passed");

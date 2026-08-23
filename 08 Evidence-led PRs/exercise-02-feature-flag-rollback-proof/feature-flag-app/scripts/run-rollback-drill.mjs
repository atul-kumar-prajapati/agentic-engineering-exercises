import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { performance } from "node:perf_hooks";
import { pathToFileURL } from "node:url";
import { executeScenario, sha256 } from "./rollout-harness.mjs";

function argument(name) {
  const index = process.argv.indexOf(name);
  if (index === -1 || !process.argv[index + 1]) throw new Error(`Missing ${name}`);
  return process.argv[index + 1];
}

const sourceSha = argument("--sha");
const jsonOutput = path.resolve(argument("--json"));
const markdownOutput = path.resolve(argument("--markdown"));
assert.match(sourceSha, /^[a-f0-9]{40}$/, "--sha must be a full Git SHA");
const actor = "release-engineer";
const reason = "Invoice preview error rate exceeded rollback threshold";
const timestamp = "2026-08-14T10:30:00.000Z";
const expectedRevision = "rollback-2026-08-14T10-30-00-000Z";
const context = { targetingKey: "acct-100", accountId: "acct-100" };
const sourceConfig = path.resolve("config/invoice-preview.json");
const rollbackScript = path.resolve("scripts/rollback-invoice-preview.mjs");
const tracePreload = path.resolve("scripts/fs-rollback-trace-preload.mjs");
assert.ok(fs.existsSync(rollbackScript), "missing scripts/rollback-invoice-preview.mjs");

function runAsync(arguments_, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, arguments_, { encoding: "utf8", ...options });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("close", (status) => resolve({ status, stdout, stderr }));
  });
}

function traceEnvironment(configPath, tracePath, extra = {}) {
  const preload = `--import=${pathToFileURL(tracePreload).href}`;
  return {
    ...process.env,
    NODE_OPTIONS: [process.env.NODE_OPTIONS, preload].filter(Boolean).join(" "),
    ROLLBACK_TRACE_CONFIG: configPath,
    ROLLBACK_TRACE_OUTPUT: tracePath,
    ...extra,
  };
}

function readTrace(tracePath) {
  if (!fs.existsSync(tracePath)) return [];
  return fs.readFileSync(tracePath, "utf8").trim().split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
}

function assertAtomicTrace(trace, configPath, { expectRename }) {
  const target = path.resolve(configPath);
  const lock = `${target}.lock`;
  const openIndex = trace.findIndex((item) => ["open", "write"].includes(item.operation) && item.path === lock && item.exclusive === true);
  const readIndex = trace.findIndex((item, index) => index > openIndex && item.operation === "read" && item.path === target);
  const writeIndex = trace.findIndex((item, index) => index > readIndex && item.operation === "write" && item.path !== target && path.dirname(item.path) === path.dirname(target));
  const renameIndex = trace.findIndex((item, index) => index > writeIndex && item.operation === "rename" && item.to === target && item.from !== target);
  assert.ok(openIndex >= 0, "rollback did not acquire an exclusive config lock");
  assert.ok(readIndex > openIndex, "rollback did not re-read the revision while holding the lock");
  assert.ok(writeIndex > readIndex, "rollback did not write a same-directory temporary file after the revision check");
  if (expectRename) assert.ok(renameIndex > writeIndex, "rollback did not rename the temporary file over the target");
  else assert.equal(renameIndex, -1, "fault-injected rollback replaced the target");
  assert.equal(trace.some((item) => item.operation === "write" && item.path === target), false, "rollback wrote directly to the target");
  return { exclusiveLockObserved: true, revisionRecheckObserved: true, temporaryWriteObserved: true, renameObserved: expectRename };
}

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "invoice-preview-rollback-"));
try {
  const configPath = path.join(temporary, "invoice-preview.json");
  fs.copyFileSync(sourceConfig, configPath);
  const beforeConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const beforeDigest = sha256(configPath);
  const before = await executeScenario({ config: beforeConfig, context });
  assert.equal(before.outcome.experience, "preview");
  assert.equal(before.observations.apiCalls.length, 1);
  assert.equal(before.observations.telemetry.length, 1);

  const bytesBeforeInvalidInput = fs.readFileSync(configPath);
  const invalidCommand = spawnSync(process.execPath, [
    rollbackScript,
    "--config", configPath,
    "--actor", actor,
    "--reason", reason,
    "--timestamp", "not-a-timestamp",
    "--expected-revision", beforeConfig.revision,
  ], { encoding: "utf8" });
  assert.notEqual(invalidCommand.status, 0, "rollback command must reject an invalid timestamp");
  assert.deepEqual(fs.readFileSync(configPath), bytesBeforeInvalidInput, "invalid input mutated the configuration");

  const interruptionPath = path.join(temporary, "interruption.json");
  const interruptionTracePath = path.join(temporary, "interruption-trace.jsonl");
  fs.copyFileSync(sourceConfig, interruptionPath);
  const interruptionBytes = fs.readFileSync(interruptionPath);
  const interruption = spawnSync(process.execPath, [
    rollbackScript, "--config", interruptionPath, "--actor", actor, "--reason", reason,
    "--timestamp", timestamp, "--expected-revision", beforeConfig.revision,
  ], { encoding: "utf8", env: traceEnvironment(interruptionPath, interruptionTracePath, { NODE_ENV: "test", ROLLBACK_TEST_FAIL_BEFORE_RENAME: "1" }) });
  assert.notEqual(interruption.status, 0, "fault-injected rollback must return non-zero");
  assert.deepEqual(fs.readFileSync(interruptionPath), interruptionBytes, "interrupted rollback changed the configuration");
  const interruptionLeftovers = fs.readdirSync(temporary).filter((name) => name.startsWith("interruption.json.") || name === "interruption.json.lock");
  assert.deepEqual(interruptionLeftovers, [], "interrupted rollback left temporary or lock files");
  const interruptionProtocol = assertAtomicTrace(readTrace(interruptionTracePath), interruptionPath, { expectRename: false });

  const concurrentPath = path.join(temporary, "concurrent.json");
  fs.copyFileSync(sourceConfig, concurrentPath);
  const concurrentBase = [rollbackScript, "--config", concurrentPath, "--actor", actor, "--reason", reason, "--expected-revision", beforeConfig.revision];
  const concurrentResults = await Promise.all([
    runAsync([...concurrentBase, "--timestamp", "2026-08-14T10:31:00.000Z"], { env: traceEnvironment(concurrentPath, path.join(temporary, "concurrent-a.jsonl"), { ROLLBACK_TRACE_HOLD_LOCK_MS: "250" }) }),
    runAsync([...concurrentBase, "--timestamp", "2026-08-14T10:32:00.000Z"], { env: traceEnvironment(concurrentPath, path.join(temporary, "concurrent-b.jsonl"), { ROLLBACK_TRACE_HOLD_LOCK_MS: "250" }) }),
  ]);
  const successfulCommands = concurrentResults.filter((result) => result.status === 0).length;
  const rejectedCommands = concurrentResults.filter((result) => result.status !== 0).length;
  assert.equal(successfulCommands, 1, "exactly one concurrent rollback must succeed");
  assert.equal(rejectedCommands, 1, "one concurrent rollback must reject the stale or locked revision");
  const concurrentConfig = JSON.parse(fs.readFileSync(concurrentPath, "utf8"));
  assert.equal(concurrentConfig.enabled, false);
  assert.deepEqual(concurrentConfig.allowlist, []);

  const commandArguments = [rollbackScript, "--config", configPath, "--actor", actor, "--reason", reason, "--timestamp", timestamp, "--expected-revision", beforeConfig.revision];
  const successTracePath = path.join(temporary, "success-trace.jsonl");
  const startTime = new Date().toISOString();
  const start = performance.now();
  const command = spawnSync(process.execPath, commandArguments, { encoding: "utf8", env: traceEnvironment(configPath, successTracePath) });
  const elapsedMs = Math.round((performance.now() - start) * 1000) / 1000;
  const endTime = new Date().toISOString();
  if (command.status !== 0) throw new Error(`rollback command failed: ${command.stderr || command.stdout}`);
  const successProtocol = assertAtomicTrace(readTrace(successTracePath), configPath, { expectRename: true });

  const afterConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
  assert.equal(afterConfig.enabled, false);
  assert.deepEqual(afterConfig.allowlist, []);
  assert.deepEqual(afterConfig.lastRollback, { actor, reason, timestamp, previousRevision: beforeConfig.revision });
  assert.equal(afterConfig.revision, expectedRevision);
  assert.ok(elapsedMs <= 1000, `rollback took ${elapsedMs}ms, expected no more than 1000ms`);
  const after = await executeScenario({ config: afterConfig, context });
  assert.deepEqual(after.outcome, { experience: "legacy", reason: "flag-disabled" });
  assert.deepEqual(after.observations.apiCalls, []);
  assert.deepEqual(after.observations.telemetry, []);

  const displayCommand = `node scripts/rollback-invoice-preview.mjs --config <temporary-config> --actor ${actor} --reason "${reason}" --timestamp ${timestamp} --expected-revision ${beforeConfig.revision}`;
  const evidence = {
    schemaVersion: 1,
    sourceSha,
    command: displayCommand,
    actor,
    reason,
    timestamp,
    startTime,
    endTime,
    elapsedMs,
    configBeforeSha256: beforeDigest,
    configAfterSha256: sha256(configPath),
    configBefore: beforeConfig,
    configAfter: afterConfig,
    behaviorBefore: { outcome: before.outcome, apiCalls: before.observations.apiCalls, telemetry: before.observations.telemetry },
    behaviorAfter: { outcome: after.outcome, apiCalls: after.observations.apiCalls, telemetry: after.observations.telemetry },
    invalidInputCheck: { rejected: true, configUnchanged: true },
    interruptionCheck: { rejected: true, configUnchanged: true, temporaryFilesRemaining: 0, ...interruptionProtocol },
    atomicProtocol: successProtocol,
    concurrencyCheck: { successfulCommands, rejectedCommands, exitCodes: concurrentResults.map((result) => result.status), validConfig: true },
    result: "passed",
    remainingCleanup: "Remove invoice-preview-v2 and preview-specific telemetry after rollout retirement approval.",
  };
  const markdown = `# Invoice Preview Rollback Drill

Source SHA: ${sourceSha}

Command: \`${displayCommand}\`

Start time: ${startTime}
End time: ${endTime}
Elapsed: ${elapsedMs} ms

## Before rollback

- Flag: enabled
- Revision: ${beforeConfig.revision}
- Experience: preview
- API calls: 1
- Telemetry events: 1, invoice_preview_viewed

## After rollback

- Flag: disabled
- Target allowlist: empty
- Revision: ${afterConfig.revision}
- Previous revision: ${afterConfig.lastRollback.previousRevision}
- Experience: legacy
- API calls: 0
- Telemetry events: 0

Result: PASS. The rollback changed behavior without a deployment and completed within the 1000 ms objective.

Invalid-input check: PASS. An invalid timestamp returned non-zero and left the configuration unchanged.

Interrupted update: PASS. Fault injection stopped before replacement, preserved the original bytes, and left no temporary or lock files.

Concurrent rollback: PASS. Exactly one command replaced the expected revision and the other was rejected.

Remaining cleanup: ${evidence.remainingCleanup}
`;
  fs.mkdirSync(path.dirname(jsonOutput), { recursive: true });
  fs.mkdirSync(path.dirname(markdownOutput), { recursive: true });
  fs.writeFileSync(jsonOutput, `${JSON.stringify(evidence, null, 2)}\n`);
  fs.writeFileSync(markdownOutput, markdown);
  console.log(`Source SHA: ${sourceSha}`);
  console.log(`Elapsed: ${elapsedMs} ms`);
  console.log("Before: preview, API calls 1, telemetry events 1");
  console.log("After: legacy, API calls 0, telemetry events 0");
  console.log("PASS rollback command atomically disabled the flag and cleared targeting without a deploy");
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}

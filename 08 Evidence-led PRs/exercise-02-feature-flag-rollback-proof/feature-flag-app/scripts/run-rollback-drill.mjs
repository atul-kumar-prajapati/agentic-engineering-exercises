import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { performance } from "node:perf_hooks";
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
assert.ok(fs.existsSync(rollbackScript), "missing scripts/rollback-invoice-preview.mjs");
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
  ], { encoding: "utf8" });
  assert.notEqual(invalidCommand.status, 0, "rollback command must reject an invalid timestamp");
  assert.deepEqual(fs.readFileSync(configPath), bytesBeforeInvalidInput, "invalid input mutated the configuration");

  const startTime = new Date().toISOString();
  const start = performance.now();
  const commandArguments = [rollbackScript, "--config", configPath, "--actor", actor, "--reason", reason, "--timestamp", timestamp];
  const command = spawnSync(process.execPath, commandArguments, { encoding: "utf8" });
  const elapsedMs = Math.round((performance.now() - start) * 1000) / 1000;
  const endTime = new Date().toISOString();
  if (command.status !== 0) throw new Error(`rollback command failed: ${command.stderr || command.stdout}`);

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

  const displayCommand = `node scripts/rollback-invoice-preview.mjs --config <temporary-config> --actor ${actor} --reason "${reason}" --timestamp ${timestamp}`;
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

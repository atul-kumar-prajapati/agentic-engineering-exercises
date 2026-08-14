import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import os from "node:os";
import { sha256 } from "./rollout-harness.mjs";

const FLAG_KEY = "invoice-preview-v2";
const EXPECTED_ROLLBACK_REVISION = "rollback-2026-08-14T10-30-00-000Z";
const CONTEXTS = {
  enabled: { targetingKey: "acct-100", accountId: "acct-100" },
  disabled: { targetingKey: "acct-999", accountId: "acct-999" },
  "provider-error": { targetingKey: "acct-100", accountId: "acct-100" },
};

function readJson(file, failures, label) {
  if (!fs.existsSync(file)) { failures.push(`missing ${label}`); return null; }
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { failures.push(`${label} is invalid JSON`); return null; }
}

function exactObject(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

function sha256Text(source) {
  return crypto.createHash("sha256").update(source).digest("hex");
}

export function verifyScenarioDocument(document, scenario, sourceSha, configDigest) {
  const failures = [];
  if (document?.schemaVersion !== 1) failures.push(`${scenario} schemaVersion must be 1`);
  if (document?.sourceSha !== sourceSha) failures.push(`${scenario} sourceSha differs`);
  if (document?.scenario !== scenario || document?.flagKey !== FLAG_KEY) failures.push(`${scenario} identity is incorrect`);
  if (document?.configSha256 !== configDigest) failures.push(`${scenario} config digest differs`);
  if (!exactObject(document?.context, CONTEXTS[scenario])) failures.push(`${scenario} context differs`);
  if (!Array.isArray(document?.evaluation) || document.evaluation.length !== 1) failures.push(`${scenario} must contain one flag evaluation`);
  else {
    const evaluation = document.evaluation[0];
    if (evaluation.flagKey !== FLAG_KEY || evaluation.defaultValue !== false || !exactObject(evaluation.context, CONTEXTS[scenario])) failures.push(`${scenario} flag evaluation is unsafe or changes targeting`);
  }
  const expected = {
    enabled: { experience: "preview", reason: null, api: 1, telemetry: 1 },
    disabled: { experience: "legacy", reason: "flag-disabled", api: 0, telemetry: 0 },
    "provider-error": { experience: "legacy", reason: "flag-evaluation-error", api: 0, telemetry: 0 },
  }[scenario];
  if (document?.outcome?.experience !== expected.experience || (document?.outcome?.reason ?? null) !== expected.reason) failures.push(`${scenario} outcome is incorrect`);
  if (!Array.isArray(document?.apiCalls) || document.apiCalls.length !== expected.api) failures.push(`${scenario} API call count is incorrect`);
  if (!Array.isArray(document?.telemetry) || document.telemetry.length !== expected.telemetry) failures.push(`${scenario} telemetry count is incorrect`);
  if (scenario === "enabled" && document?.telemetry?.length === 1) {
    const event = document.telemetry[0];
    if (event.name !== "invoice_preview_viewed" || !exactObject(event.attributes, { targetingKey: "acct-100", accountId: "acct-100", flagKey: FLAG_KEY })) failures.push("enabled telemetry identity or targeting is incorrect");
    if (!exactObject(document.apiCalls, [{ accountId: "acct-100" }])) failures.push("enabled API call targeting is incorrect");
    if (!exactObject(document.outcome, { experience: "preview", preview: { accountId: "acct-100", total: 42, currency: "USD" } })) failures.push("enabled preview outcome is incorrect");
  }
  if (document?.result !== "passed") failures.push(`${scenario} result must be passed`);
  return failures;
}

export function verifyRollbackDocument(document, sourceSha, originalConfig, originalDigest) {
  const failures = [];
  if (document?.schemaVersion !== 1 || document?.sourceSha !== sourceSha || document?.result !== "passed") failures.push("rollback identity or result is incorrect");
  if (document?.actor !== "release-engineer" || !document?.reason?.includes("error rate") || document?.timestamp !== "2026-08-14T10:30:00.000Z") failures.push("rollback audit inputs are incorrect");
  if (typeof document?.startTime !== "string" || Number.isNaN(Date.parse(document.startTime)) || typeof document?.endTime !== "string" || Number.isNaN(Date.parse(document.endTime))) failures.push("rollback start or end time is invalid");
  if (Date.parse(document?.endTime) < Date.parse(document?.startTime)) failures.push("rollback end time precedes start time");
  if (typeof document?.elapsedMs !== "number" || document.elapsedMs < 0 || document.elapsedMs > 1000) failures.push("rollback elapsed time must be between 0 and 1000 ms");
  if (document?.configBeforeSha256 !== originalDigest || !exactObject(document?.configBefore, originalConfig)) failures.push("rollback before configuration differs from the protected input");
  const after = document?.configAfter;
  if (after?.schemaVersion !== 1 || after?.flagKey !== FLAG_KEY || after?.enabled !== false || !exactObject(after?.allowlist, [])) failures.push("rollback configuration did not disable the flag and clear targeting");
  if (after?.lastRollback?.actor !== document?.actor || after?.lastRollback?.reason !== document?.reason || after?.lastRollback?.timestamp !== document?.timestamp || after?.lastRollback?.previousRevision !== originalConfig.revision) failures.push("rollback audit record is incomplete");
  if (after?.revision !== EXPECTED_ROLLBACK_REVISION) failures.push("rollback revision is not deterministic");
  const serializedAfter = after ? `${JSON.stringify(after, null, 2)}\n` : "";
  if (document?.configAfterSha256 !== sha256Text(serializedAfter) || document.configAfterSha256 === document.configBeforeSha256) failures.push("rollback after digest does not match the recorded configuration");
  if (document?.behaviorBefore?.outcome?.experience !== "preview" || document?.behaviorBefore?.apiCalls?.length !== 1 || document?.behaviorBefore?.telemetry?.length !== 1) failures.push("rollback before behavior is not an enabled preview");
  if (!exactObject(document?.behaviorAfter?.outcome, { experience: "legacy", reason: "flag-disabled" }) || !exactObject(document?.behaviorAfter?.apiCalls, []) || !exactObject(document?.behaviorAfter?.telemetry, [])) failures.push("rollback after behavior has preview side effects");
  if (!document?.command?.includes("rollback-invoice-preview.mjs") || !document?.command?.includes("<temporary-config>")) failures.push("rollback command is missing or exposes an unstable path");
  if (!exactObject(document?.invalidInputCheck, { rejected: true, configUnchanged: true })) failures.push("rollback invalid-input safety check is missing");
  if (typeof document?.remainingCleanup !== "string" || document.remainingCleanup.length < 30) failures.push("rollback remaining cleanup is missing");
  return failures;
}

export function verifyRollbackMarkdown(source, document) {
  const failures = [];
  for (const value of [
    "Source SHA", document.sourceSha, document.command, "Start time", document.startTime, "End time", document.endTime,
    "Elapsed", String(document.elapsedMs), "Flag: enabled", "Experience: preview", "API calls: 1", "Telemetry events: 1",
    "Flag: disabled", "Target allowlist: empty", "Experience: legacy", "API calls: 0", "Telemetry events: 0",
    document.configBefore.revision, document.configAfter.revision, "Result: PASS", "Remaining cleanup", document.remainingCleanup,
    "Invalid-input check: PASS",
  ]) if (!source.includes(String(value))) failures.push(`rollback-drill.md is missing ${value}`);
  return failures;
}

export function verifyRollbackScriptSource(source) {
  const failures = [];
  if (!/(?:renameSync|rename)\s*\(/.test(source)) failures.push("rollback command must atomically rename a temporary file over the target");
  if (!/(?:writeFileSync|writeFile)\s*\(/.test(source)) failures.push("rollback command must write formatted JSON to a temporary file");
  if (!/(?:dirname|path\.parse)\s*\(/.test(source) && !/(?:\.tmp|temporary)/i.test(source)) failures.push("rollback temporary file must be created in the target directory");
  if (!source.includes("previousRevision") || !source.includes("lastRollback")) failures.push("rollback command must preserve audit history");
  return failures;
}

function git(root, args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

export function verifyGitBinding({ repositoryRoot, exerciseRoot, sourceSha }) {
  const failures = [];
  try {
    const head = git(repositoryRoot, ["rev-parse", "HEAD"]);
    git(repositoryRoot, ["merge-base", "--is-ancestor", sourceSha, head]);
    const prefix = path.relative(repositoryRoot, exerciseRoot).split(path.sep).join("/");
    for (const relative of ["feature-flag-app/src/rollout/invoicePreview.mjs", "feature-flag-app/scripts/rollback-invoice-preview.mjs"]) git(repositoryRoot, ["show", `${sourceSha}:${prefix}/${relative}`]);
    const changed = git(repositoryRoot, ["diff", "--name-only", sourceSha]).split(/\r?\n/).filter(Boolean);
    for (const file of changed) if (!file.startsWith(`${prefix}/evidence/`)) failures.push(`commit after sourceSha changes non-evidence file ${file}`);
  } catch { failures.push("sourceSha must be an ancestor containing the rollout fix and rollback command"); }
  return failures;
}

export function runReproduction({ appRoot, sourceSha }) {
  const failures = [];
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "rollout-evidence-reproduction-"));
  try {
    for (const scenario of Object.keys(CONTEXTS)) {
      const output = path.join(temporary, `${scenario}.json`);
      const result = spawnSync(process.execPath, [path.join(appRoot, "scripts", "capture-rollout-evidence.mjs"), "--scenario", scenario, "--sha", sourceSha, "--output", output], { cwd: appRoot, encoding: "utf8" });
      if (result.status !== 0) failures.push(`${scenario} evidence reproduction failed: ${result.stderr || result.stdout}`);
    }
    const rollback = spawnSync(process.execPath, [path.join(appRoot, "scripts", "run-rollback-drill.mjs"), "--sha", sourceSha, "--json", path.join(temporary, "rollback.json"), "--markdown", path.join(temporary, "rollback.md")], { cwd: appRoot, encoding: "utf8" });
    if (rollback.status !== 0) failures.push(`rollback drill reproduction failed: ${rollback.stderr || rollback.stdout}`);
  } finally { fs.rmSync(temporary, { recursive: true, force: true }); }
  return failures;
}

export function loadSubmission(exerciseRoot) {
  const failures = [];
  const evidenceRoot = path.join(exerciseRoot, "evidence");
  const scenarios = {};
  for (const scenario of Object.keys(CONTEXTS)) scenarios[scenario] = readJson(path.join(evidenceRoot, `${scenario}.json`), failures, `evidence/${scenario}.json`);
  const rollback = readJson(path.join(evidenceRoot, "rollback-drill.json"), failures, "evidence/rollback-drill.json");
  const markdownPath = path.join(evidenceRoot, "rollback-drill.md");
  const markdown = fs.existsSync(markdownPath) ? fs.readFileSync(markdownPath, "utf8") : (failures.push("missing evidence/rollback-drill.md"), "");
  return { failures, scenarios, rollback, markdown };
}

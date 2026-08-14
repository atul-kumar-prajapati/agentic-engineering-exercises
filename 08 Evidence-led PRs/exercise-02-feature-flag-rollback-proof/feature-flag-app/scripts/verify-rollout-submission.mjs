import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  loadSubmission,
  runReproduction,
  verifyGitBinding,
  verifyRollbackDocument,
  verifyRollbackMarkdown,
  verifyRollbackScriptSource,
  verifyScenarioDocument,
} from "./rollout-verification.mjs";
import { sha256 } from "./rollout-harness.mjs";

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const repositoryRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: appRoot, encoding: "utf8" }).trim();
const configPath = path.join(appRoot, "config", "invoice-preview.json");
const originalConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
const configDigest = sha256(configPath);
const rollbackScriptPath = path.join(appRoot, "scripts", "rollback-invoice-preview.mjs");
const submission = loadSubmission(exerciseRoot);
const failures = [...submission.failures];
const sourceShas = [submission.rollback?.sourceSha, ...Object.values(submission.scenarios).map((document) => document?.sourceSha)].filter(Boolean);
const sourceSha = sourceShas[0] ?? "";
if (!/^[a-f0-9]{40}$/.test(sourceSha) || sourceShas.some((value) => value !== sourceSha)) failures.push("all evidence files must use one full source SHA");
for (const [scenario, document] of Object.entries(submission.scenarios)) if (document) failures.push(...verifyScenarioDocument(document, scenario, sourceSha, configDigest));
if (submission.rollback) {
  failures.push(...verifyRollbackDocument(submission.rollback, sourceSha, originalConfig, configDigest));
  failures.push(...verifyRollbackMarkdown(submission.markdown, submission.rollback));
}
if (fs.existsSync(rollbackScriptPath)) failures.push(...verifyRollbackScriptSource(fs.readFileSync(rollbackScriptPath, "utf8")));
else failures.push("missing scripts/rollback-invoice-preview.mjs");
if (/^[a-f0-9]{40}$/.test(sourceSha)) {
  failures.push(...verifyGitBinding({ repositoryRoot, exerciseRoot, sourceSha }));
  failures.push(...runReproduction({ appRoot, sourceSha }));
}

if (failures.length) {
  console.error(`Rollout proof verification failed:\n${[...new Set(failures)].map((failure) => `- ${failure}`).join("\n")}`);
  process.exit(1);
}
console.log(`Source SHA: ${sourceSha}`);
console.log("PASS enabled evidence proves one evaluation, one API call, and one accurate telemetry event");
console.log("PASS disabled and provider-error evidence prove legacy behavior with zero preview side effects");
console.log("PASS rollback drill atomically disables the flag, clears targeting, records audit data, and meets the 1000 ms objective");
console.log("PASS protected scenarios and rollback drill reproduce from the submitted implementation");
console.log("PASS Git source binding and evidence-only follow-up history verified");

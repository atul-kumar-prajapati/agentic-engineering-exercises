import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  APP,
  EXERCISE,
  WORKFLOW,
  runGeneratorCase,
  runRejectedGeneratorCase,
  verifyEvidencePack,
  verifyGitBinding,
  verifyWorkflow,
} from "./evidence-verification.mjs";

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const repositoryRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: appRoot, encoding: "utf8" }).trim();
const fixturePath = path.join(exerciseRoot, "fixtures", "check-results.json");
const packPath = path.join(exerciseRoot, "evidence", "generated", "pr-evidence.json");
const generator = path.join(appRoot, "scripts", "generate-pr-evidence.mjs");
const failures = [];
let sourceSha = "";

if (!fs.existsSync(packPath)) failures.push("missing evidence/generated/pr-evidence.json");
else {
  try { sourceSha = JSON.parse(fs.readFileSync(packPath, "utf8")).sourceSha ?? ""; }
  catch { failures.push("evidence/generated/pr-evidence.json is invalid JSON"); }
}

if (/^[a-f0-9]{40}$/.test(sourceSha)) {
  failures.push(...verifyEvidencePack({ fixturePath, outputRoot: path.dirname(packPath), expectedSha: sourceSha }));
  failures.push(...verifyGitBinding({ repositoryRoot, exerciseRoot, sourceSha }));
} else failures.push("submitted evidence sourceSha must be a full 40-character Git SHA");

failures.push(...verifyWorkflow(path.join(repositoryRoot, WORKFLOW)));

const readmePath = path.join(exerciseRoot, "evidence", "README.md");
if (!fs.existsSync(readmePath)) failures.push("missing evidence/README.md");
else {
  const readme = fs.readFileSync(readmePath, "utf8").toLowerCase();
  for (const term of ["source sha", "checkout-smoke", "failed", "exit code", "risk", "reviewer action", "rollback", "reproduce", "evidence/generated/summary.md", "evidence/generated/artifacts/checkout-smoke.txt"]) if (!readme.includes(term)) failures.push(`evidence/README.md is missing ${term}`);
}

if (!fs.existsSync(generator)) failures.push(`missing ${APP}/scripts/generate-pr-evidence.mjs`);
else {
  const dynamicSha = /^[a-f0-9]{40}$/.test(sourceSha) ? sourceSha : execFileSync("git", ["rev-parse", "HEAD"], { cwd: repositoryRoot, encoding: "utf8" }).trim();
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "pr-evidence-verification-"));
  try {
    for (const fixture of ["check-results.json", "check-results-pass.json", "check-results-multiple-failures.json"]) {
      const result = runGeneratorCase({ generator, fixturePath: path.join(exerciseRoot, "fixtures", fixture), sourceSha: dynamicSha, outputRoot: path.join(temporary, fixture.replace(".json", "")) });
      for (const failure of result.failures) failures.push(`${fixture}: ${failure}`);
    }
    const invalidRoot = path.join(temporary, "invalid-fixtures");
    fs.mkdirSync(path.join(invalidRoot, "artifacts"), { recursive: true });
    fs.writeFileSync(path.join(temporary, "outside.txt"), "must not be copied\n");
    fs.writeFileSync(path.join(invalidRoot, "artifacts", "result.txt"), "result\n");
    const invalidFixtures = {
      "path-escape.json": { schemaVersion: 1, checks: [{ name: "escape", command: "read outside", exitCode: 0, result: "passed", outputPath: "../outside.txt", risk: "high", reviewerAction: "reject", rollback: "revert" }] },
      "result-mismatch.json": { schemaVersion: 1, checks: [{ name: "mismatch", command: "fail", exitCode: 2, result: "passed", outputPath: "artifacts/result.txt", risk: "high", reviewerAction: "reject", rollback: "revert" }] },
      "missing-artifact.json": { schemaVersion: 1, checks: [{ name: "missing", command: "read missing", exitCode: 1, result: "failed", outputPath: "artifacts/not-created.txt", risk: "high", reviewerAction: "reject", rollback: "revert" }] },
    };
    for (const [name, fixture] of Object.entries(invalidFixtures)) {
      const fixtureFile = path.join(invalidRoot, name);
      fs.writeFileSync(fixtureFile, `${JSON.stringify(fixture, null, 2)}\n`);
      const result = runRejectedGeneratorCase({ generator, fixturePath: fixtureFile, sourceSha: dynamicSha, outputRoot: path.join(temporary, `rejected-${name}`) });
      for (const failure of result.failures) failures.push(`${name}: ${failure}`);
    }
  } finally { fs.rmSync(temporary, { recursive: true, force: true }); }
}

if (failures.length) {
  console.error(`PR evidence verification failed:\n${[...new Set(failures)].map((failure) => `- ${failure}`).join("\n")}`);
  process.exit(1);
}

console.log(`Source SHA: ${sourceSha}`);
console.log(`PASS submitted failing pack preserves all fixture results and artifact bytes`);
console.log(`PASS generator preserves the first failing exit code for single and multiple failures, and exit 0 for all-passing results`);
console.log(`PASS generator rejects missing artifacts, path traversal, and inconsistent result fixtures without writing a pack`);
console.log(`PASS ${WORKFLOW} uses pull_request, read-only permissions, pinned actions, stable paths, always-run verification and upload, and no failure masking`);
console.log(`PASS Git history contains the generator and workflow at source SHA; later changes are evidence only`);
console.log(`PASS verified evidence contract for ${EXERCISE}`);

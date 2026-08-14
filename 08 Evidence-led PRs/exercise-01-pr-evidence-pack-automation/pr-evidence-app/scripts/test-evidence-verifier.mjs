import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { ACTION_PINS, APP, EXERCISE, WORKFLOW, runGeneratorCase, verifyEvidencePack, verifyGitBinding, verifyWorkflow } from "./evidence-verification.mjs";

function git(root, args) { return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim(); }
function write(root, relative, content) { const file = path.join(root, relative); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, content); return file; }

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "evidence-verifier-"));
try {
  const repositoryRoot = path.join(temporary, "repo");
  const exerciseRoot = path.join(repositoryRoot, EXERCISE);
  const appRoot = path.join(repositoryRoot, APP);
  fs.mkdirSync(appRoot, { recursive: true });
  git(repositoryRoot, ["init"]); git(repositoryRoot, ["config", "core.autocrlf", "false"]); git(repositoryRoot, ["config", "user.name", "Verifier"]); git(repositoryRoot, ["config", "user.email", "verifier@example.test"]);
  const fixture = write(exerciseRoot, "fixtures/cases.json", `${JSON.stringify({ schemaVersion: 1, checks: [
    { name: "unit", command: "npm test", exitCode: 0, result: "passed", outputPath: "artifacts/unit.txt", risk: "low risk", reviewerAction: "review unit output", rollback: "revert commit" },
    { name: "smoke", command: "npm run smoke", exitCode: 3, result: "failed", outputPath: "artifacts/smoke.txt", risk: "high risk", reviewerAction: "block merge", rollback: "do not deploy" },
  ] }, null, 2)}\n`);
  write(exerciseRoot, "fixtures/artifacts/unit.txt", "PASS unit\n");
  write(exerciseRoot, "fixtures/artifacts/smoke.txt", "FAIL smoke\n");
  const generator = write(appRoot, "scripts/generate-pr-evidence.mjs", `import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
const value = (name) => process.argv[process.argv.indexOf(name) + 1];
const fixturePath = path.resolve(value("--fixture")); const sourceSha = value("--sha"); const output = path.resolve(value("--output"));
const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8")); fs.mkdirSync(path.join(output, "artifacts"), { recursive: true });
const checks = fixture.checks.map((check) => { const source = path.resolve(path.dirname(fixturePath), check.outputPath); const relative = "artifacts/" + path.basename(check.outputPath); const target = path.join(output, relative); fs.copyFileSync(source, target); return { name: check.name, command: check.command, exitCode: check.exitCode, result: check.result, risk: check.risk, reviewerAction: check.reviewerAction, rollback: check.rollback, artifact: { path: relative, sha256: crypto.createHash("sha256").update(fs.readFileSync(target)).digest("hex") } }; });
const failed = checks.find((check) => check.exitCode !== 0); const pack = { schemaVersion: 1, sourceSha, fixtureSha256: crypto.createHash("sha256").update(fs.readFileSync(fixturePath)).digest("hex"), overallResult: failed ? "failed" : "passed", overallExitCode: failed?.exitCode ?? 0, checks };
fs.writeFileSync(path.join(output, "pr-evidence.json"), JSON.stringify(pack, null, 2) + "\\n");
const summary = ["# PR Evidence", "Source SHA: " + sourceSha, "Overall result: " + pack.overallResult, "Overall exit code: " + pack.overallExitCode];
for (const check of checks) summary.push("## " + check.name, "Result: " + check.result, "Exit code: " + check.exitCode, "Artifact: " + check.artifact.path, "SHA-256: " + check.artifact.sha256, "Risk: " + check.risk, "Reviewer action: " + check.reviewerAction, "Rollback: " + check.rollback);
fs.writeFileSync(path.join(output, "summary.md"), summary.join("\\n") + "\\n"); process.exitCode = pack.overallExitCode;
`);
  write(repositoryRoot, WORKFLOW, `name: Evidence
on:
  pull_request:
    paths:
      - '${EXERCISE}/**'
      - '${WORKFLOW}'
permissions:
  contents: read
jobs:
  evidence:
    runs-on: ubuntu-24.04
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@${ACTION_PINS.checkout.sha}
        with:
          persist-credentials: false
      - uses: actions/setup-node@${ACTION_PINS["setup-node"].sha}
        with:
          node-version-file: .nvmrc
          cache: npm
          cache-dependency-path: ${APP}/package-lock.json
      - run: npm ci
        working-directory: ${APP}
      - run: npm run evidence:generate -- --sha "\${{ github.sha }}"
        working-directory: ${APP}
      - if: \${{ always() }}
        run: npm run evidence:verify
        working-directory: ${APP}
      - if: \${{ always() }}
        uses: actions/upload-artifact@${ACTION_PINS["upload-artifact"].sha}
        with:
          name: pr-evidence-\${{ github.sha }}
          path: ${EXERCISE}/evidence/generated
          if-no-files-found: error
          retention-days: 5
`);
  git(repositoryRoot, ["add", "."]); git(repositoryRoot, ["commit", "-m", "source"]); const sourceSha = git(repositoryRoot, ["rev-parse", "HEAD"]);
  const outputRoot = path.join(exerciseRoot, "evidence", "generated");
  const result = runGeneratorCase({ generator, fixturePath: fixture, sourceSha, outputRoot });
  assert.equal(result.exitCode, 3); assert.deepEqual(result.failures, []);
  write(exerciseRoot, "evidence/README.md", `Source SHA is recorded in evidence/generated/summary.md. smoke failed with exit code 3. Risk: high. Reviewer action: block. Rollback: do not deploy. Reproduce with generator. Artifact: evidence/generated/artifacts/smoke.txt.\n`);
  git(repositoryRoot, ["add", "."]); git(repositoryRoot, ["commit", "-m", "evidence"]);
  assert.deepEqual(verifyWorkflow(path.join(repositoryRoot, WORKFLOW)), []);
  assert.deepEqual(verifyEvidencePack({ fixturePath: fixture, outputRoot, expectedSha: sourceSha }), []);
  assert.deepEqual(verifyGitBinding({ repositoryRoot, exerciseRoot, sourceSha }), []);
  const pack = JSON.parse(fs.readFileSync(path.join(outputRoot, "pr-evidence.json"), "utf8")); pack.checks[1].exitCode = 0; fs.writeFileSync(path.join(outputRoot, "pr-evidence.json"), JSON.stringify(pack));
  assert.ok(verifyEvidencePack({ fixturePath: fixture, outputRoot, expectedSha: sourceSha }).some((failure) => failure.includes("changed exitCode")));
  console.log("PR evidence verifier self-test passed");
} finally { fs.rmSync(temporary, { recursive: true, force: true }); }

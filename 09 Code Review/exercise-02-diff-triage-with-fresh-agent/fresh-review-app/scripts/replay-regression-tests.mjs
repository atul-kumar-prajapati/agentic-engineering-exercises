import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const testRelative = "tests/cache-regressions.test.ts";
const testPath = path.join(appRoot, testRelative);
if (!fs.existsSync(testPath)) throw new Error(`missing ${testRelative}`);
const review = JSON.parse(fs.readFileSync(path.join(exerciseRoot, "evidence", "review.json"), "utf8"));
const findingIds = review.findings.filter((finding) => finding.decision === "fix").map((finding) => finding.id);
const manifest = JSON.parse(fs.readFileSync(path.join(exerciseRoot, "fixtures", "manifest.json"), "utf8"));
const bundle = path.join(exerciseRoot, "fixtures", manifest.bundle);
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "triage-regression-replay-"));
const vitest = path.join(appRoot, "node_modules", "vitest", "vitest.mjs");

function run(root, output) {
  const result = spawnSync(process.execPath, [vitest, "run", testRelative, "--reporter=json", `--outputFile=${output}`], { cwd: root, encoding: "utf8" });
  if (!fs.existsSync(output)) throw new Error(`Vitest did not produce structured results:\n${result.stderr || result.stdout}`);
  const report = JSON.parse(fs.readFileSync(output, "utf8"));
  return { result, report, assertions: (report.testResults ?? []).flatMap((suite) => suite.assertionResults ?? []) };
}

const assertionFor = (assertions, id, status) => assertions.some((assertion) => `${assertion.fullName ?? ""} ${assertion.title ?? ""}`.includes(`[${id}]`) && assertion.status === status);

try {
  execFileSync("git", ["clone", "-q", bundle, temporary]);
  execFileSync("git", ["checkout", "-q", manifest.headSha], { cwd: temporary });
  fs.mkdirSync(path.join(temporary, "tests"), { recursive: true });
  fs.copyFileSync(testPath, path.join(temporary, testRelative));
  fs.symlinkSync(path.join(appRoot, "node_modules"), path.join(temporary, "node_modules"), "junction");
  const before = run(temporary, path.join(temporary, "before-results.json"));
  const afterOutput = path.join(os.tmpdir(), `triage-after-${process.pid}-${Date.now()}.json`);
  const after = run(appRoot, afterOutput);
  fs.rmSync(afterOutput, { force: true });
  if (before.result.status === 0) throw new Error("learner regression tests unexpectedly pass on the risky review head");
  if (before.report.numFailedTestSuites > 0 && before.assertions.length === 0) throw new Error("risky-head run failed during collection instead of executing regression assertions");
  for (const id of findingIds) if (!assertionFor(before.assertions, id, "failed")) throw new Error(`${id} does not have a named regression assertion that fails on the risky head`);
  if (after.result.status !== 0) throw new Error(`learner regression tests fail after remediation:\n${after.result.stderr || after.result.stdout}`);
  for (const id of findingIds) if (!assertionFor(after.assertions, id, "passed")) throw new Error(`${id} does not have the same named regression assertion passing after remediation`);
  console.log(`PASS ${findingIds.length} confirmed findings each fail on protected head ${manifest.headSha}`);
  console.log(`PASS the same ${findingIds.length} named regressions pass on the remediation source`);
} finally { fs.rmSync(temporary, { recursive: true, force: true }); }

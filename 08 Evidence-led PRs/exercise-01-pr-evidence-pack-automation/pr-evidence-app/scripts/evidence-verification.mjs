import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync, execFileSync } from "node:child_process";
import YAML from "yaml";

export const EXERCISE = "08 Evidence-led PRs/exercise-01-pr-evidence-pack-automation";
export const APP = `${EXERCISE}/pr-evidence-app`;
export const WORKFLOW = ".github/workflows/evidence-led-pr-01.yml";
export const ACTION_PINS = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, "..", "..", "docs", "action-pins.json"), "utf8"));

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function readJson(file, failures, label) {
  if (!fs.existsSync(file)) { failures.push(`missing ${label}`); return null; }
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { failures.push(`${label} is invalid JSON`); return null; }
}

function inside(root, candidate) {
  const absolute = path.resolve(root, candidate);
  return absolute === root || absolute.startsWith(`${root}${path.sep}`) ? absolute : null;
}

function expectedOutcome(fixture) {
  const failed = fixture.checks.find((check) => check.exitCode !== 0);
  return failed ? { result: "failed", exitCode: failed.exitCode } : { result: "passed", exitCode: 0 };
}

function fixtureChecks(fixture, fixtureRoot, failures) {
  if (fixture?.schemaVersion !== 1 || !Array.isArray(fixture?.checks) || fixture.checks.length === 0) {
    failures.push("fixture must use schemaVersion 1 and contain checks");
    return [];
  }
  const filenames = new Set();
  for (const [index, check] of fixture.checks.entries()) {
    const label = `fixture check ${index + 1}`;
    for (const field of ["name", "command", "result", "outputPath", "risk", "reviewerAction", "rollback"]) if (typeof check[field] !== "string" || !check[field].trim()) failures.push(`${label} is missing ${field}`);
    if (!Number.isInteger(check.exitCode) || check.exitCode < 0) failures.push(`${label} has an invalid exitCode`);
    if (!(["passed", "failed"].includes(check.result)) || (check.result === "passed") !== (check.exitCode === 0)) failures.push(`${label} result and exitCode disagree`);
    const source = inside(fixtureRoot, check.outputPath ?? "");
    if (!source || !fs.existsSync(source) || !fs.statSync(source).isFile()) failures.push(`${label} artifact is missing or escapes the fixture directory`);
    const filename = path.basename(check.outputPath ?? "");
    if (filenames.has(filename)) failures.push(`fixture contains duplicate artifact filename ${filename}`);
    filenames.add(filename);
  }
  return fixture.checks;
}

export function verifyEvidencePack({ fixturePath, outputRoot, expectedSha }) {
  const failures = [];
  const fixture = readJson(fixturePath, failures, "fixture");
  const fixtureRoot = path.dirname(fixturePath);
  const checks = fixture ? fixtureChecks(fixture, fixtureRoot, failures) : [];
  const pack = readJson(path.join(outputRoot, "pr-evidence.json"), failures, "pr-evidence.json");
  if (!pack || !fixture) return failures;
  if (pack.schemaVersion !== 1) failures.push("evidence schemaVersion must be 1");
  if (!/^[a-f0-9]{40}$/.test(pack.sourceSha ?? "") || pack.sourceSha !== expectedSha) failures.push("evidence sourceSha does not match the requested commit");
  if (pack.fixtureSha256 !== sha256(fixturePath)) failures.push("evidence fixtureSha256 does not match the fixture bytes");
  const outcome = expectedOutcome(fixture);
  if (pack.overallResult !== outcome.result || pack.overallExitCode !== outcome.exitCode) failures.push("overall result does not preserve the first failing exit code");
  if (!Array.isArray(pack.checks) || pack.checks.length !== checks.length) failures.push("evidence must contain every fixture check exactly once");
  else {
    for (const [index, expected] of checks.entries()) {
      const actual = pack.checks[index];
      for (const field of ["name", "command", "exitCode", "result", "risk", "reviewerAction", "rollback"]) if (actual?.[field] !== expected[field]) failures.push(`${expected.name} changed ${field}`);
      const expectedPath = `artifacts/${path.basename(expected.outputPath)}`;
      if (actual?.artifact?.path !== expectedPath || path.isAbsolute(actual?.artifact?.path ?? "") || actual?.artifact?.path?.includes("..") || actual?.artifact?.path?.includes("\\")) failures.push(`${expected.name} artifact path is not stable`);
      const artifact = inside(outputRoot, actual?.artifact?.path ?? "");
      const source = inside(fixtureRoot, expected.outputPath);
      if (!artifact || !fs.existsSync(artifact) || !fs.statSync(artifact).isFile()) failures.push(`${expected.name} copied artifact is missing`);
      else {
        if (!/^[a-f0-9]{64}$/.test(actual?.artifact?.sha256 ?? "") || actual.artifact.sha256 !== sha256(artifact)) failures.push(`${expected.name} artifact digest does not match`);
        if (source && !fs.readFileSync(source).equals(fs.readFileSync(artifact))) failures.push(`${expected.name} artifact bytes differ from the fixture`);
      }
    }
  }
  const artifactDir = path.join(outputRoot, "artifacts");
  if (fs.existsSync(artifactDir)) {
    const actualFiles = fs.readdirSync(artifactDir).filter((name) => fs.statSync(path.join(artifactDir, name)).isFile()).sort();
    const expectedFiles = checks.map((check) => path.basename(check.outputPath)).sort();
    if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) failures.push("artifact directory contains missing or unexpected files");
  }
  const summaryPath = path.join(outputRoot, "summary.md");
  if (!fs.existsSync(summaryPath)) failures.push("missing generated summary.md");
  else {
    const summary = fs.readFileSync(summaryPath, "utf8");
    for (const value of [pack.sourceSha, pack.overallResult, String(pack.overallExitCode)]) if (!summary.includes(value)) failures.push(`summary.md is missing ${value}`);
    for (const check of pack.checks ?? []) {
      for (const value of [check.name, check.result, String(check.exitCode), check.artifact?.path, check.artifact?.sha256, check.risk, check.reviewerAction, check.rollback]) if (value !== undefined && !summary.includes(String(value))) failures.push(`summary.md is missing ${check.name} value: ${value}`);
    }
  }
  return failures;
}

function allSteps(workflow) {
  return Object.values(workflow?.jobs ?? {}).flatMap((job) => job?.steps ?? []);
}

function actionPinned(step, name) {
  return step?.uses === `${ACTION_PINS[name].repository}@${ACTION_PINS[name].sha}`;
}

export function verifyWorkflow(workflowPath) {
  const failures = [];
  if (!fs.existsSync(workflowPath)) return ["missing repository workflow .github/workflows/evidence-led-pr-01.yml"];
  const source = fs.readFileSync(workflowPath, "utf8");
  let workflow;
  try { workflow = YAML.parse(source); }
  catch { return ["workflow is invalid YAML"]; }
  if (/pull_request_target/.test(source)) failures.push("workflow must not use pull_request_target");
  if (/continue-on-error\s*:/i.test(source)) failures.push("workflow must not use continue-on-error on any step");
  if (/secrets\./i.test(source)) failures.push("workflow must not use repository secrets");
  const trigger = workflow?.on?.pull_request;
  if (!trigger) failures.push("workflow must trigger on pull_request");
  const paths = trigger?.paths ?? [];
  if (!Array.isArray(paths) || !paths.some((item) => item === `${EXERCISE}/**`) || !paths.includes(WORKFLOW)) failures.push("workflow pull_request paths must include the exercise and its workflow");
  const permissions = workflow?.permissions;
  if (!permissions || permissions.contents !== "read" || Object.entries(permissions).some(([name, value]) => name !== "contents" || value !== "read")) failures.push("workflow permissions must contain only contents: read");
  const jobs = Object.values(workflow?.jobs ?? {});
  if (jobs.length !== 1) failures.push("workflow must use one evidence job");
  const job = jobs[0] ?? {};
  if (workflow?.defaults || job?.defaults) failures.push("workflow must not override the shell used by evidence commands");
  if (job?.if !== undefined) failures.push("evidence job must not be conditional or skippable");
  if (job["runs-on"] !== "ubuntu-24.04") failures.push("evidence job must use ubuntu-24.04");
  if (!Number.isInteger(job["timeout-minutes"]) || job["timeout-minutes"] > 10) failures.push("evidence job timeout-minutes must be 10 or less");
  const steps = allSteps(workflow);
  const checkout = steps.find((step) => step.uses?.startsWith("actions/checkout@"));
  if (!actionPinned(checkout, "checkout")) failures.push("actions/checkout must be pinned to a full commit SHA");
  if (checkout?.with?.["persist-credentials"] !== false) failures.push("checkout must set persist-credentials: false");
  const setup = steps.find((step) => step.uses?.startsWith("actions/setup-node@"));
  if (!actionPinned(setup, "setup-node")) failures.push("actions/setup-node must be pinned to a full commit SHA");
  if (setup?.with?.["node-version-file"] !== ".nvmrc" || setup?.with?.cache !== "npm" || setup?.with?.["cache-dependency-path"] !== `${APP}/package-lock.json`) failures.push("setup-node must use .nvmrc and the exercise lockfile cache");
  const install = steps.find((step) => typeof step.run === "string" && /^npm ci\s*$/m.test(step.run));
  if (!install || install["working-directory"] !== APP) failures.push("workflow must run npm ci in pr-evidence-app");
  const generateCommand = /^npm run evidence:generate -- --sha\s+["']?\$\{\{\s*github\.sha\s*\}\}["']?$/;
  const generate = steps.find((step) => typeof step.run === "string" && generateCommand.test(step.run.trim()));
  if (!generate || generate["working-directory"] !== APP) failures.push("workflow must use exactly: npm run evidence:generate -- --sha \"${{ github.sha }}\"");
  if (generate?.if !== undefined || generate?.shell !== undefined) failures.push("evidence generation must not be conditional or use a custom shell");
  const verify = steps.find((step) => typeof step.run === "string" && step.run.trim() === "npm run evidence:verify");
  if (!verify || verify["working-directory"] !== APP || !String(verify.if ?? "").includes("always()")) failures.push("evidence verification must run with if: always()");
  const upload = steps.find((step) => step.uses?.startsWith("actions/upload-artifact@"));
  if (!actionPinned(upload, "upload-artifact")) failures.push("actions/upload-artifact must be pinned to a full commit SHA");
  if (!String(upload?.if ?? "").includes("always()")) failures.push("artifact upload must use if: always()");
  if (upload?.with?.path !== `${EXERCISE}/evidence/generated` || upload?.with?.["if-no-files-found"] !== "error") failures.push("upload must use the stable generated evidence path and fail when missing");
  if (!String(upload?.with?.name ?? "").includes("github.sha")) failures.push("artifact name must include github.sha");
  const retention = Number(upload?.with?.["retention-days"]);
  if (!Number.isInteger(retention) || retention < 1 || retention > 7) failures.push("artifact retention-days must be between 1 and 7");
  for (const step of steps.filter((item) => typeof item.uses === "string")) if (!/@[a-f0-9]{40}$/.test(step.uses)) failures.push(`action is not pinned to a full commit SHA: ${step.uses}`);
  return [...new Set(failures)];
}

export function runGeneratorCase({ generator, fixturePath, sourceSha, outputRoot }) {
  fs.mkdirSync(outputRoot, { recursive: true });
  const result = spawnSync(process.execPath, [generator, "--fixture", fixturePath, "--sha", sourceSha, "--output", outputRoot], { encoding: "utf8" });
  const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
  const expectedExit = expectedOutcome(fixture).exitCode;
  const failures = [];
  if (result.signal) failures.push(`generator was terminated by ${result.signal}`);
  if (result.status !== expectedExit) failures.push(`generator exit ${result.status} does not preserve expected exit ${expectedExit}`);
  failures.push(...verifyEvidencePack({ fixturePath, outputRoot, expectedSha: sourceSha }));
  return { failures: [...new Set(failures)], stdout: result.stdout, stderr: result.stderr, exitCode: result.status };
}

export function runRejectedGeneratorCase({ generator, fixturePath, sourceSha, outputRoot }) {
  fs.mkdirSync(outputRoot, { recursive: true });
  const result = spawnSync(process.execPath, [generator, "--fixture", fixturePath, "--sha", sourceSha, "--output", outputRoot], { encoding: "utf8" });
  const failures = [];
  if (result.signal) failures.push(`generator was terminated by ${result.signal}`);
  if (result.status === 0) failures.push("generator accepted an invalid fixture");
  if (fs.existsSync(path.join(outputRoot, "pr-evidence.json"))) failures.push("generator wrote a pack for an invalid fixture");
  return { failures, stdout: result.stdout, stderr: result.stderr, exitCode: result.status };
}

export function verifyGitBinding({ repositoryRoot, exerciseRoot, sourceSha }) {
  const failures = [];
  try {
    const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repositoryRoot, encoding: "utf8" }).trim();
    execFileSync("git", ["merge-base", "--is-ancestor", sourceSha, head], { cwd: repositoryRoot });
    for (const relative of [`${APP}/scripts/generate-pr-evidence.mjs`, WORKFLOW]) execFileSync("git", ["show", `${sourceSha}:${relative}`], { cwd: repositoryRoot });
    const changed = execFileSync("git", ["diff", "--name-only", sourceSha], { cwd: repositoryRoot, encoding: "utf8" }).trim().split(/\r?\n/).filter(Boolean);
    const allowed = `${path.relative(repositoryRoot, path.join(exerciseRoot, "evidence")).split(path.sep).join("/")}/`;
    for (const file of changed) if (!file.startsWith(allowed)) failures.push(`commit after sourceSha changes non-evidence file ${file}`);
  } catch { failures.push("sourceSha must be an ancestor containing the generator and workflow"); }
  return failures;
}

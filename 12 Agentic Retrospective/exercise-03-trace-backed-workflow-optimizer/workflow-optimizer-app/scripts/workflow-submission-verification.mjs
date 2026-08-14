import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { computeBenchmark, responseSha256 } from "./workflow-grading.mjs";

function git(root, args) { return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim(); }

export function validateInstructions(instructions, cases) {
  const failures = [];
  const lines = instructions.split(/\r?\n/).length;
  const words = instructions.trim().split(/\s+/).filter(Boolean).length;
  if (lines > 120) failures.push("candidate workflow exceeds 120 lines");
  if (words > 1800) failures.push("candidate workflow exceeds 1,800 words");
  const forbidden = cases.flatMap((item) => [item.id, ...item.assertions.map((assertion) => assertion.id)]);
  for (const phrase of forbidden) if (instructions.toLowerCase().includes(phrase.toLowerCase())) failures.push(`candidate workflow leaks protected identifier ${phrase}`);
  for (const term of ["scope", "clarify", "authoritative", "contradiction", "context", "failed", "stop", "verification", "exit code", "completion"] ) if (!instructions.toLowerCase().includes(term)) failures.push(`candidate workflow is missing general behavior ${term}`);
  return failures;
}

export function validateRuns(cases, baseline, candidate) {
  const failures = [];
  const all = [...baseline, ...candidate];
  for (const item of cases) for (const lane of ["baseline", "candidate"]) {
    const runs = all.filter((run) => run.caseId === item.id && run.lane === lane);
    if (runs.length !== 3 || JSON.stringify(runs.map((run) => run.run).sort()) !== JSON.stringify([1, 2, 3])) failures.push(`${item.id}/${lane} needs runs 1, 2, and 3 exactly once`);
  }
  const conditionFields = ["agent", "model", "settingsHash", "toolsHash", "permissionsHash", "timeLimitMinutes"];
  for (const item of cases) for (const runNumber of [1, 2, 3]) {
    const before = baseline.find((run) => run.caseId === item.id && run.run === runNumber);
    const after = candidate.find((run) => run.caseId === item.id && run.run === runNumber);
    for (const field of conditionFields) if (before?.[field] !== after?.[field]) failures.push(`${item.id}/${runNumber} changed ${field}`);
  }
  for (const run of all) {
    if (!Number.isInteger(run.tokens) || run.tokens <= 0 || !Number.isInteger(run.durationMs) || run.durationMs <= 0) failures.push(`${run.caseId}/${run.lane}/${run.run} needs positive integer cost metrics`);
    if (run.responseSha256 !== responseSha256(run.response)) failures.push(`${run.caseId}/${run.lane}/${run.run} response hash mismatch`);
  }
  return failures;
}

export function verifyWorkflowHistory({ repositoryRoot, exerciseRoot, baselineSha, candidateSha }) {
  const failures = [];
  try {
    if (git(repositoryRoot, ["rev-parse", `${candidateSha}^`]) !== baselineSha) failures.push("candidateSha must directly follow baselineSha");
    git(repositoryRoot, ["merge-base", "--is-ancestor", candidateSha, "HEAD"]);
    const prefix = path.relative(repositoryRoot, exerciseRoot).split(path.sep).join("/");
    const workflowFile = `${prefix}/workflow-optimizer-app/workflow/instructions.md`;
    const actual = git(repositoryRoot, ["diff-tree", "--no-commit-id", "--name-only", "-r", candidateSha]).split(/\r?\n/).filter(Boolean);
    if (actual.length !== 1 || actual[0] !== workflowFile) failures.push("candidateSha must change only workflow/instructions.md");
    const baselineWorkflow = git(repositoryRoot, ["show", `${baselineSha}:${workflowFile}`]).replaceAll("\r\n", "\n");
    const fixture = fs.readFileSync(path.join(exerciseRoot, "workflow-optimizer-app/fixtures/workflow-baseline.md"), "utf8").replaceAll("\r\n", "\n");
    if (baselineWorkflow !== fixture) failures.push("baselineSha does not contain the protected baseline workflow");
    const later = git(repositoryRoot, ["diff", "--name-only", candidateSha, "HEAD"]).split(/\r?\n/).filter(Boolean);
    for (const file of later) if (!file.startsWith(`${prefix}/evidence/`)) failures.push(`commit after candidateSha changes non-evidence file ${file}`);
  } catch { failures.push("baselineSha and candidateSha must be ordered full ancestor commits"); }
  return failures;
}

export function compareBenchmarks(expected, actual) {
  return JSON.stringify(expected) === JSON.stringify(actual) ? [] : ["benchmark.json does not exactly match deterministic grading of raw runs"];
}

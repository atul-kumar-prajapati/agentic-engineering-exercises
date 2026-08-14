import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

export function verifyReviewDocument(document, manifest, expectations, exerciseRoot) {
  const failures = [];
  if (document?.schemaVersion !== 1) failures.push("review schemaVersion must be 1");
  if (document?.baseSha !== manifest.baseSha || document?.headSha !== manifest.headSha || document?.comparison !== manifest.comparison) failures.push("review range does not match the protected bundle");
  if (!/^[a-f0-9]{40}$/.test(document?.sourceSha ?? "")) failures.push("sourceSha must be one full commit SHA");
  if (typeof document?.reviewerSession !== "string" || document.reviewerSession.trim().length < 8) failures.push("reviewerSession must identify the fresh review pass");
  if (document?.mergeDecision !== "request-changes") failures.push("mergeDecision must request changes for the vulnerable head");
  if (!Array.isArray(document?.findings) || document.findings.length !== expectations.findings.length) failures.push("review must contain every required finding exactly once");
  const seen = new Set();
  for (const expected of expectations.findings) {
    const finding = document?.findings?.find((candidate) => candidate.id === expected.id);
    if (!finding) { failures.push(`missing finding ${expected.id}`); continue; }
    if (seen.has(finding.id)) failures.push(`duplicate finding ${finding.id}`);
    seen.add(finding.id);
    for (const field of ["severity", "source", "decision", "file", "line"]) if (finding[field] !== expected[field]) failures.push(`${expected.id} ${field} is incorrect`);
    for (const field of ["scenario", "impact", "evidence"]) if (typeof finding[field] !== "string" || finding[field].trim().length < 35) failures.push(`${expected.id} needs concrete ${field}`);
    const searchable = `${finding.scenario} ${finding.impact} ${finding.evidence}`.toLowerCase();
    for (const term of expected.testTerms) if (!searchable.includes(term)) failures.push(`${expected.id} evidence is missing ${term}`);
    if (expected.decision === "fix") {
      if (typeof finding.fix !== "string" || finding.fix.length < 20) failures.push(`${expected.id} needs a concrete fix`);
      if (typeof finding.testPath !== "string" || !finding.testPath.startsWith("tests/") || !fs.existsSync(path.join(exerciseRoot, "review-gauntlet-app", finding.testPath))) failures.push(`${expected.id} testPath must reference a learner regression test under tests/`);
    } else if (!searchable.includes("source-controlled") || !searchable.includes("static")) failures.push(`${expected.id} dismissal must prove the source is static and source-controlled`);
  }
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
    for (const relative of [
      "review-gauntlet-app/src/components/ActionComposer.tsx",
      "review-gauntlet-app/src/components/WorkQueue.tsx",
      "review-gauntlet-app/src/server/reviewPolicy.ts",
      "review-gauntlet-app/tests/review-regressions.test.ts",
    ]) git(repositoryRoot, ["show", `${sourceSha}:${prefix}/${relative}`]);
    const changed = git(repositoryRoot, ["diff", "--name-only", sourceSha]).split(/\r?\n/).filter(Boolean);
    for (const file of changed) if (!file.startsWith(`${prefix}/evidence/`)) failures.push(`commit after sourceSha changes non-evidence file ${file}`);
  } catch { failures.push("sourceSha must be an ancestor containing fixes and learner regression tests"); }
  return failures;
}

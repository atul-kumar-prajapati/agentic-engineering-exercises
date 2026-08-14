import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const REQUIRED_CONTEXT = ["docs/review-brief.md", "fixtures/manifest.json", "pr/review-target.diff"];
const EXCLUDED_CONTEXT = ["docs/implementer-notes.md", "earlier reviews", "expected finding IDs", "implementation chat"];

export function verifyTriageDocument(document, session, manifest, expectations, exerciseRoot) {
  const failures = [];
  if (document?.schemaVersion !== 1) failures.push("review schemaVersion must be 1");
  if (session?.schemaVersion !== 1 || session?.contextMode !== "fresh") failures.push("reviewer session must declare schemaVersion 1 and fresh context");
  if (typeof session?.sessionId !== "string" || session.sessionId.trim().length < 8 || document?.reviewerSessionId !== session?.sessionId) failures.push("review and session must share a unique reviewer session ID");
  if (typeof session?.tool !== "string" || session.tool.trim().length < 3) failures.push("reviewer session must name the tool or model");
  if (!Number.isFinite(Date.parse(session?.startedAt ?? ""))) failures.push("reviewer session needs an ISO start time");
  if (JSON.stringify([...(session?.providedFiles ?? [])].sort()) !== JSON.stringify(REQUIRED_CONTEXT)) failures.push("fresh reviewer must receive exactly the protected brief, manifest, and diff");
  for (const excluded of EXCLUDED_CONTEXT) if (!(session?.excludedContext ?? []).includes(excluded)) failures.push(`fresh reviewer exclusions are missing ${excluded}`);
  if (!/^[a-f0-9]{64}$/.test(session?.promptSha256 ?? "")) failures.push("reviewer session must bind the exact prompt with promptSha256");
  if (document?.baseSha !== manifest.baseSha || document?.headSha !== manifest.headSha || document?.comparison !== manifest.comparison) failures.push("review range does not match the protected bundle");
  if (!/^[a-f0-9]{40}$/.test(document?.sourceSha ?? "")) failures.push("sourceSha must be one full commit SHA");
  if (document?.mergeDecision !== "request-changes") failures.push("mergeDecision must request changes for the risky head");
  if (!Array.isArray(document?.findings) || document.findings.length !== expectations.findings.length) failures.push("review must contain every required finding exactly once");

  const ids = new Set();
  for (const expected of expectations.findings) {
    const finding = document?.findings?.find((candidate) => candidate.id === expected.id);
    if (!finding) { failures.push(`missing finding ${expected.id}`); continue; }
    if (ids.has(finding.id)) failures.push(`duplicate finding ${finding.id}`);
    ids.add(finding.id);
    for (const field of ["classification", "severity", "decision", "file", "line"]) if (finding[field] !== expected[field]) failures.push(`${expected.id} ${field} is incorrect`);
    if (!["high", "medium"].includes(finding.confidence)) failures.push(`${expected.id} needs high or medium confidence`);
    for (const field of ["scenario", "impact", "evidence"]) if (typeof finding[field] !== "string" || finding[field].trim().length < 35) failures.push(`${expected.id} needs concrete ${field}`);
    const searchable = `${finding.scenario} ${finding.impact} ${finding.evidence}`.toLowerCase();
    for (const term of expected.testTerms) if (!searchable.includes(term)) failures.push(`${expected.id} evidence is missing ${term}`);
    if (expected.decision === "fix") {
      if (typeof finding.fix !== "string" || finding.fix.trim().length < 20) failures.push(`${expected.id} needs a focused fix`);
      const testPath = finding.testPath;
      if (typeof testPath !== "string" || !testPath.startsWith("tests/") || !fs.existsSync(path.join(exerciseRoot, "fresh-review-app", testPath))) failures.push(`${expected.id} testPath must reference a learner test under tests/`);
    } else if (finding.fix || finding.testPath) failures.push(`${expected.id} is unsupported and must not claim a fix or regression test`);
  }
  return failures;
}

function git(root, args) { return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim(); }

export function verifyGitBinding({ repositoryRoot, exerciseRoot, sourceSha }) {
  const failures = [];
  try {
    const head = git(repositoryRoot, ["rev-parse", "HEAD"]);
    git(repositoryRoot, ["merge-base", "--is-ancestor", sourceSha, head]);
    const prefix = path.relative(repositoryRoot, exerciseRoot).split(path.sep).join("/");
    const required = [
      `${prefix}/fresh-review-app/src/App.tsx`,
      `${prefix}/fresh-review-app/src/services/workflowApi.ts`,
      `${prefix}/fresh-review-app/tests/cache-regressions.test.ts`,
    ].sort();
    for (const file of required) git(repositoryRoot, ["show", `${sourceSha}:${file}`]);
    const sourceFiles = git(repositoryRoot, ["diff-tree", "--no-commit-id", "--name-only", "-r", sourceSha]).split(/\r?\n/).filter(Boolean).sort();
    if (JSON.stringify(sourceFiles) !== JSON.stringify(required)) failures.push("sourceSha must contain only the two focused source fixes and learner cache test");
    const laterFiles = git(repositoryRoot, ["diff", "--name-only", sourceSha, head]).split(/\r?\n/).filter(Boolean);
    for (const file of laterFiles) if (!file.startsWith(`${prefix}/evidence/`)) failures.push(`commit after sourceSha changes non-evidence file ${file}`);
  } catch { failures.push("sourceSha must be an ancestor containing the focused fixes and learner cache test"); }
  return failures;
}

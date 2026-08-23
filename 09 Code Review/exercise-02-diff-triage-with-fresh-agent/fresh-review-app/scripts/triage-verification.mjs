import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const REQUIRED_CONTEXT = ["docs/review-brief.md", "fixtures/manifest.json", "pr/review-target.diff"];
const EXCLUDED_CONTEXT = ["instructor answer key", "earlier reviews", "expected finding IDs", "implementation chat"];

function diffFacts(diff) {
  const added = new Map();
  const visible = new Map();
  let current;
  for (const line of diff.replaceAll("\r\n", "\n").split("\n")) {
    const header = line.match(/^diff --git a\/(.+?) b\/(.+)$/);
    if (header) {
      current = header[2];
      added.set(current, new Set());
      visible.set(current, new Set());
      continue;
    }
    if (!current || line.startsWith("+++") || line.startsWith("---") || line.startsWith("@@")) continue;
    const anchor = /^[ +]/.test(line) ? line.slice(1).trim() : "";
    if (anchor.length < 5) continue;
    visible.get(current).add(anchor);
    if (line.startsWith("+")) added.get(current).add(anchor);
  }
  return { added, visible };
}

export function verifyTriageDocument(document, session, manifest, exerciseRoot, diff) {
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
  if (!Array.isArray(document?.findings) || document.findings.length < 4) failures.push("review needs every supported blocker and the supplied-claim decision");

  const facts = diffFacts(diff);
  const ids = new Set();
  const signatures = new Set();
  let fixes = 0;
  let dismissals = 0;
  for (const finding of document?.findings ?? []) {
    if (!/^[A-Z][A-Z0-9-]{2,30}$/.test(finding?.id ?? "") || ids.has(finding.id)) failures.push("finding IDs must be unique stable identifiers");
    ids.add(finding?.id);
    if (!['blocker', 'unsupported'].includes(finding?.classification)) failures.push(`${finding?.id ?? "finding"} classification is invalid`);
    if (!['critical', 'high', 'medium', 'low', 'info'].includes(finding?.severity)) failures.push(`${finding?.id ?? "finding"} severity is invalid`);
    if (!['high', 'medium'].includes(finding?.confidence)) failures.push(`${finding?.id ?? "finding"} needs high or medium confidence`);
    if (!['fix', 'dismiss'].includes(finding?.decision)) failures.push(`${finding?.id ?? "finding"} decision is invalid`);
    if (!facts.visible.has(finding?.file)) failures.push(`${finding?.id ?? "finding"} file is not in the protected diff`);
    const anchor = typeof finding?.anchor === "string" ? finding.anchor.trim() : "";
    const acceptedAnchors = finding?.decision === "fix" ? facts.added.get(finding?.file) : facts.visible.get(finding?.file);
    if (anchor.length < 5 || !acceptedAnchors?.has(anchor)) failures.push(`${finding?.id ?? "finding"} needs an exact code anchor from the protected diff`);
    const signature = `${finding?.file}:${anchor}`;
    if (signatures.has(signature)) failures.push(`${finding?.id ?? "finding"} repeats another finding's code anchor`);
    signatures.add(signature);
    for (const field of ["scenario", "impact", "evidence"]) if (typeof finding?.[field] !== "string" || finding[field].trim().length < 35) failures.push(`${finding?.id ?? "finding"} needs concrete ${field}`);
    if (finding?.decision === "fix") {
      fixes += 1;
      if (finding.classification !== "blocker") failures.push(`${finding.id} fixed finding must be classified as a blocker`);
      if (typeof finding.fix !== "string" || finding.fix.trim().length < 20) failures.push(`${finding.id} needs a focused fix`);
      if (typeof finding.testPath !== "string" || !finding.testPath.startsWith("tests/") || !fs.existsSync(path.join(exerciseRoot, "fresh-review-app", finding.testPath))) failures.push(`${finding.id} testPath must reference a learner test under tests/`);
    } else {
      dismissals += 1;
      if (finding.classification !== "unsupported") failures.push(`${finding.id} dismissed finding must be classified as unsupported`);
      if (typeof finding.dismissalProof !== "string" || finding.dismissalProof.trim().length < 40) failures.push(`${finding.id} needs concrete dismissalProof`);
      if (finding.fix || finding.testPath) failures.push(`${finding.id} is unsupported and must not claim a fix or regression test`);
    }
  }
  if (fixes < 4 || dismissals < 1) failures.push("review must contain every supported fix and at least one proved dismissal");
  for (const file of facts.added.keys()) if (!(document?.findings ?? []).some((finding) => finding.file === file && finding.decision === "fix")) failures.push(`changed file has no confirmed finding: ${file}`);
  return [...new Set(failures)];
}

function git(root, args) { return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim(); }

export function verifyGitBinding({ repositoryRoot, exerciseRoot, sourceSha }) {
  const failures = [];
  try {
    const head = git(repositoryRoot, ["rev-parse", "HEAD"]);
    git(repositoryRoot, ["merge-base", "--is-ancestor", sourceSha, head]);
    const prefix = path.relative(repositoryRoot, exerciseRoot).split(path.sep).join("/");
    const required = new Set([
      `${prefix}/fresh-review-app/src/App.tsx`,
      `${prefix}/fresh-review-app/src/services/workflowApi.ts`,
      `${prefix}/fresh-review-app/tests/cache-regressions.test.ts`,
    ]);
    for (const file of required) git(repositoryRoot, ["show", `${sourceSha}:${file}`]);
    const sourceFiles = git(repositoryRoot, ["diff-tree", "--no-commit-id", "--name-only", "-r", sourceSha]).split(/\r?\n/).filter(Boolean);
    for (const file of required) if (!sourceFiles.includes(file)) failures.push(`sourceSha does not change required file ${file}`);
    for (const file of sourceFiles) if (!file.startsWith(`${prefix}/fresh-review-app/src/`) && !file.startsWith(`${prefix}/fresh-review-app/tests/`)) failures.push(`sourceSha contains out-of-scope file ${file}`);
    const laterFiles = git(repositoryRoot, ["diff", "--name-only", sourceSha, head]).split(/\r?\n/).filter(Boolean);
    for (const file of laterFiles) if (!file.startsWith(`${prefix}/evidence/`)) failures.push(`commit after sourceSha changes non-evidence file ${file}`);
  } catch { failures.push("sourceSha must be an ancestor containing the focused fixes and learner cache test"); }
  return failures;
}

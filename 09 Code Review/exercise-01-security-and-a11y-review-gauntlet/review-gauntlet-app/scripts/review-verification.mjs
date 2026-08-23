import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

function diffFacts(diff) {
  const anchors = new Map();
  let current;
  for (const line of diff.replaceAll("\r\n", "\n").split("\n")) {
    const header = line.match(/^diff --git a\/(.+?) b\/(.+)$/);
    if (header) {
      current = header[2];
      anchors.set(current, new Set());
    } else if (current && line.startsWith("+") && !line.startsWith("+++")) {
      const anchor = line.slice(1).trim();
      if (anchor.length >= 5) anchors.get(current).add(anchor);
    }
  }
  return anchors;
}

export function verifyReviewDocument(document, manifest, exerciseRoot, diff, semgrep) {
  const failures = [];
  if (document?.schemaVersion !== 1) failures.push("review schemaVersion must be 1");
  if (document?.baseSha !== manifest.baseSha || document?.headSha !== manifest.headSha || document?.comparison !== manifest.comparison) failures.push("review range does not match the protected bundle");
  if (!/^[a-f0-9]{40}$/.test(document?.sourceSha ?? "")) failures.push("sourceSha must be one full commit SHA");
  if (typeof document?.reviewerSession !== "string" || document.reviewerSession.trim().length < 8) failures.push("reviewerSession must identify the fresh review pass");
  if (document?.mergeDecision !== "request-changes") failures.push("mergeDecision must request changes for the vulnerable head");
  if (!Array.isArray(document?.findings) || document.findings.length < 4) failures.push("review needs every supported blocker and scanner dismissal");

  const diffAnchors = diffFacts(diff);
  const scannerPaths = new Set((semgrep?.results ?? []).map((result) => String(result.path).replaceAll("\\", "/")));
  const seen = new Set();
  const signatures = new Set();
  let fixes = 0;
  let dismissals = 0;
  for (const finding of document?.findings ?? []) {
    if (!/^[A-Z][A-Z0-9-]{2,30}$/.test(finding?.id ?? "") || seen.has(finding.id)) failures.push("finding IDs must be unique stable identifiers");
    seen.add(finding?.id);
    if (!['critical', 'high', 'medium', 'low', 'info'].includes(finding?.severity)) failures.push(`${finding?.id ?? "finding"} severity is invalid`);
    if (!['high', 'medium'].includes(finding?.confidence)) failures.push(`${finding?.id ?? "finding"} confidence is invalid`);
    if (!['semgrep', 'manual'].includes(finding?.source)) failures.push(`${finding?.id ?? "finding"} source is invalid`);
    if (!['fix', 'dismiss'].includes(finding?.decision)) failures.push(`${finding?.id ?? "finding"} decision is invalid`);
    const anchor = typeof finding?.anchor === "string" ? finding.anchor.trim() : "";
    const isChanged = diffAnchors.has(finding?.file);
    const protectedSource = path.join(exerciseRoot, "review-gauntlet-app", finding?.file ?? "");
    const isSurroundingScannerResult = finding?.source === "semgrep" && scannerPaths.has(finding?.file) && fs.existsSync(protectedSource);
    if (!isChanged && !isSurroundingScannerResult) failures.push(`${finding?.id ?? "finding"} file is neither changed nor a protected scanner result`);
    if (anchor.length < 5 || (isChanged ? !diffAnchors.get(finding.file).has(anchor) : !fs.readFileSync(protectedSource, "utf8").includes(anchor))) {
      failures.push(`${finding?.id ?? "finding"} needs an exact protected-source code anchor`);
    }
    const signature = `${finding?.file}:${anchor}`;
    if (signatures.has(signature)) failures.push(`${finding?.id ?? "finding"} repeats another finding's code anchor`);
    signatures.add(signature);
    for (const field of ["scenario", "impact", "evidence"]) if (typeof finding?.[field] !== "string" || finding[field].trim().length < 35) failures.push(`${finding?.id ?? "finding"} needs concrete ${field}`);
    if (finding?.decision === "fix") {
      fixes += 1;
      if (typeof finding.fix !== "string" || finding.fix.length < 20) failures.push(`${finding.id} needs a concrete fix`);
      if (typeof finding.testPath !== "string" || !finding.testPath.startsWith("tests/") || !fs.existsSync(path.join(exerciseRoot, "review-gauntlet-app", finding.testPath))) failures.push(`${finding.id} testPath must reference a learner regression test under tests/`);
    } else {
      dismissals += 1;
      if (typeof finding.dismissalProof !== "string" || finding.dismissalProof.length < 40) failures.push(`${finding.id} needs concrete dismissalProof`);
      if (finding.fix || finding.testPath) failures.push(`${finding.id} is dismissed and must not claim a fix or regression test`);
    }
  }
  if (fixes < 4 || dismissals < 1) failures.push("review must contain every supported fix and at least one proved dismissal");
  for (const file of diffAnchors.keys()) if (!(document?.findings ?? []).some((finding) => finding.file === file && finding.decision === "fix")) failures.push(`changed file has no confirmed finding: ${file}`);

  if (scannerPaths.size < 2) failures.push("Semgrep JSON must contain every scanner result from the vulnerable head");
  for (const scannerPath of scannerPaths) if (!(document?.findings ?? []).some((finding) => finding.source === "semgrep" && finding.file === scannerPath)) failures.push(`scanner result is not triaged in review.json: ${scannerPath}`);
  return [...new Set(failures)];
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
    const required = [
      "review-gauntlet-app/src/components/ActionComposer.tsx",
      "review-gauntlet-app/src/components/WorkQueue.tsx",
      "review-gauntlet-app/src/server/reviewPolicy.ts",
      "review-gauntlet-app/tests/review-regressions.test.ts",
    ];
    for (const relative of required) git(repositoryRoot, ["show", `${sourceSha}:${prefix}/${relative}`]);
    const sourceFiles = git(repositoryRoot, ["diff-tree", "--no-commit-id", "--name-only", "-r", sourceSha]).split(/\r?\n/).filter(Boolean);
    for (const relative of required) if (!sourceFiles.includes(`${prefix}/${relative}`)) failures.push(`sourceSha does not change required file ${relative}`);
    for (const file of sourceFiles) if (!file.startsWith(`${prefix}/review-gauntlet-app/src/`) && !file.startsWith(`${prefix}/review-gauntlet-app/tests/`)) failures.push(`sourceSha contains out-of-scope file ${file}`);
    const changed = git(repositoryRoot, ["diff", "--name-only", sourceSha]).split(/\r?\n/).filter(Boolean);
    for (const file of changed) if (!file.startsWith(`${prefix}/evidence/`)) failures.push(`commit after sourceSha changes non-evidence file ${file}`);
  } catch { failures.push("sourceSha must be an ancestor containing fixes and learner regression tests"); }
  return failures;
}

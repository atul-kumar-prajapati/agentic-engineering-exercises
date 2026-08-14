import path from "node:path";
import { execFileSync } from "node:child_process";

function git(root, args) { return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim(); }

export function validateReplay({ baseline, replay, baselineMetadata, replayMetadata }) {
  const failures = [];
  for (const field of ["taskId", "agent", "model", "promptHash", "timeLimitMinutes"]) {
    if (replayMetadata?.[field] !== baselineMetadata?.[field]) failures.push(`replay metadata changed ${field}`);
  }
  if (!replayMetadata?.sessionId || replayMetadata.sessionId === baselineMetadata?.sessionId) failures.push("replay must use a different non-empty sessionId");
  if (replay.unchangedFailureRetries !== 0) failures.push("replay must eliminate unchanged failed-command retries");
  if (replay.preventableCalls > baseline.preventableCalls - 2) failures.push("replay must reduce preventable calls by at least two");
  if (!replay.correctnessPassed || replay.finalVerificationRuns < 1) failures.push("replay needs passed final verification after the last write");
  return failures;
}

export function verifyRetroHistory({ repositoryRoot, exerciseRoot, sourceSha }) {
  const failures = [];
  try {
    git(repositoryRoot, ["merge-base", "--is-ancestor", sourceSha, "HEAD"]);
    const prefix = path.relative(repositoryRoot, exerciseRoot).split(path.sep).join("/");
    const expected = [
      `${prefix}/session-waste-app/src/retro/analyzeSession.mjs`,
      `${prefix}/session-waste-app/src/retro/analyzeSession.test.mjs`,
      `${prefix}/session-waste-app/src/retro/preflightPolicy.mjs`,
    ].sort();
    const actual = git(repositoryRoot, ["diff-tree", "--no-commit-id", "--name-only", "-r", sourceSha]).split(/\r?\n/).filter(Boolean).sort();
    if (JSON.stringify(actual) !== JSON.stringify(expected)) failures.push("sourceSha must contain only analyzer, preflight, and participant test");
    const later = git(repositoryRoot, ["diff", "--name-only", sourceSha, "HEAD"]).split(/\r?\n/).filter(Boolean);
    for (const file of later) if (!file.startsWith(`${prefix}/evidence/`)) failures.push(`commit after sourceSha changes non-evidence file ${file}`);
  } catch { failures.push("sourceSha must be a full ancestor commit"); }
  return failures;
}

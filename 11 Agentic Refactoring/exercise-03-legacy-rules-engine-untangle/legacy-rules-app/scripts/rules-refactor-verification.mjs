import path from "node:path";
import { execFileSync } from "node:child_process";

function git(root, args) { return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim(); }

export function validateSnapshots(before, after, expected) {
  const failures = [];
  if (JSON.stringify(before) !== JSON.stringify(after)) failures.push("before and after contract snapshots are not identical");
  if (JSON.stringify(before) !== JSON.stringify(expected)) failures.push("contract snapshot does not match all protected observations");
  return failures;
}

export function verifyRulesHistory({ repositoryRoot, exerciseRoot, characterizationSha, refactorSha }) {
  const failures = [];
  try {
    git(repositoryRoot, ["merge-base", "--is-ancestor", characterizationSha, refactorSha]);
    git(repositoryRoot, ["merge-base", "--is-ancestor", refactorSha, "HEAD"]);
    const prefix = path.relative(repositoryRoot, exerciseRoot).split(path.sep).join("/");
    const characterizationFiles = [
      `${prefix}/evidence/contract-before.json`,
      `${prefix}/legacy-rules-api/src/test/java/dev/agentic/exercise/workflow/WorkflowPolicyCharacterizationTest.java`,
    ].sort();
    const actualCharacterization = git(repositoryRoot, ["diff-tree", "--no-commit-id", "--name-only", "-r", characterizationSha]).split(/\r?\n/).filter(Boolean).sort();
    if (JSON.stringify(actualCharacterization) !== JSON.stringify(characterizationFiles)) failures.push("characterizationSha must contain only the participant test and before snapshot");
    const refactorFiles = [
      `${prefix}/legacy-rules-api/src/main/java/dev/agentic/exercise/workflow/DecisionPolicy.java`,
      `${prefix}/legacy-rules-api/src/main/java/dev/agentic/exercise/workflow/WorkflowService.java`,
    ].sort();
    const actualRefactor = git(repositoryRoot, ["diff-tree", "--no-commit-id", "--name-only", "-r", refactorSha]).split(/\r?\n/).filter(Boolean).sort();
    if (JSON.stringify(actualRefactor) !== JSON.stringify(refactorFiles)) failures.push("refactorSha must contain only DecisionPolicy and WorkflowService");
    const later = git(repositoryRoot, ["diff", "--name-only", refactorSha, "HEAD"]).split(/\r?\n/).filter(Boolean);
    for (const file of later) if (!file.startsWith(`${prefix}/evidence/`)) failures.push(`commit after refactorSha changes non-evidence file ${file}`);
  } catch { failures.push("characterizationSha must precede a focused ancestor refactorSha"); }
  return failures;
}

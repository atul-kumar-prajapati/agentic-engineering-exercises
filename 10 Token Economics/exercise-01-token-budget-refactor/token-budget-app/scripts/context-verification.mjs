import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

export function verifyContextEvidence({ plan, ledger, catalog, expectedResult }) {
  const failures = [];
  if (plan?.schemaVersion !== 1 || ledger?.schemaVersion !== 1) failures.push("plan and ledger schemaVersion must be 1");
  if (!Array.isArray(plan?.task?.tags) || !Array.isArray(plan?.task?.questionTags) || !Array.isArray(plan?.openQuestions) || !Number.isInteger(plan?.maximumBytes) || plan.maximumBytes <= 0) failures.push("plan needs task tags, questionTags, openQuestions, and a positive maximumBytes");
  if (!Array.isArray(plan?.mandatoryIds) || !plan.mandatoryIds.includes("repository-rules")) failures.push("plan must identify repository-rules as mandatory");
  if (!Array.isArray(plan?.expectedSelectedIds) || plan.expectedSelectedIds.length < 2) failures.push("plan must declare the expected selected sources");
  for (const field of ["planSha", "sourceSha"]) if (!/^[a-f0-9]{40}$/.test(ledger?.[field] ?? "")) failures.push(`${field} must be a full commit SHA`);
  if (ledger?.maximumBytes !== plan?.maximumBytes || JSON.stringify(ledger?.task) !== JSON.stringify(plan?.task)) failures.push("ledger task and maximum must match the pre-change plan");
  for (const field of ["selected", "skipped", "totalBytes", "remainingBytes", "maximumBytes", "requestedTags", "unresolvedTags"]) {
    if (JSON.stringify(ledger?.result?.[field]) !== JSON.stringify(expectedResult?.[field])) failures.push(`ledger result ${field} does not match selector output`);
  }
  const catalogIds = catalog.map((item) => item.id).sort();
  const ledgerIds = [...(ledger?.result?.selected ?? []), ...(ledger?.result?.skipped ?? [])].map((item) => item.id).sort();
  if (JSON.stringify(catalogIds) !== JSON.stringify(ledgerIds)) failures.push("ledger must account for every catalog source exactly once");
  return failures;
}

function git(root, args) { return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim(); }
export function verifyContextHistory({ repositoryRoot, exerciseRoot, planSha, sourceSha }) {
  const failures = [];
  try {
    git(repositoryRoot, ["merge-base", "--is-ancestor", planSha, sourceSha]);
    git(repositoryRoot, ["merge-base", "--is-ancestor", sourceSha, "HEAD"]);
    if (git(repositoryRoot, ["rev-parse", `${sourceSha}^`]) !== planSha) failures.push("sourceSha must be the direct child of planSha with no intermediate implementation commits");
    const prefix = path.relative(repositoryRoot, exerciseRoot).split(path.sep).join("/");
    const planFiles = [`${prefix}/evidence/context-plan.json`, `${prefix}/evidence/context-plan.md`].sort();
    const actualPlanFiles = git(repositoryRoot, ["diff-tree", "--no-commit-id", "--name-only", "-r", planSha]).split(/\r?\n/).filter(Boolean).sort();
    if (JSON.stringify(planFiles) !== JSON.stringify(actualPlanFiles)) failures.push("planSha must contain only the two pre-change context plan files");
    for (const file of planFiles) {
      const committed = execFileSync("git", ["show", `${planSha}:${file}`], { cwd: repositoryRoot });
      const current = fs.readFileSync(path.join(repositoryRoot, file));
      if (!committed.equals(current)) failures.push(`current plan differs from the pre-change plan commit: ${file}`);
    }
    const sourceFiles = [
      `${prefix}/token-budget-app/src/budget/selectContext.mjs`,
      `${prefix}/token-budget-app/src/session/adaptSession.mjs`,
      `${prefix}/token-budget-app/tests/context-selector.test.mjs`,
      `${prefix}/token-budget-app/tests/session-adapter.test.mjs`,
    ].sort();
    const actualSourceFiles = git(repositoryRoot, ["diff-tree", "--no-commit-id", "--name-only", "-r", sourceSha]).split(/\r?\n/).filter(Boolean).sort();
    if (JSON.stringify(sourceFiles) !== JSON.stringify(actualSourceFiles)) failures.push("sourceSha must contain only both implementations and their two learner regression tests");
    const later = git(repositoryRoot, ["diff", "--name-only", sourceSha, "HEAD"]).split(/\r?\n/).filter(Boolean);
    for (const file of later) if (!file.startsWith(`${prefix}/evidence/`)) failures.push(`commit after sourceSha changes non-evidence file ${file}`);
  } catch { failures.push("planSha must precede an ancestor sourceSha with the required focused history"); }
  return failures;
}

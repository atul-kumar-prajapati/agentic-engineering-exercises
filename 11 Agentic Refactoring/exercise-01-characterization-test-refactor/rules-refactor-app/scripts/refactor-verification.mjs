import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

function git(root, args) { return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim(); }
export function verifyRefactorHistory({ repositoryRoot, exerciseRoot, characterizationSha, refactorSha }) {
  const failures = [];
  try {
    git(repositoryRoot, ["merge-base", "--is-ancestor", characterizationSha, refactorSha]);
    git(repositoryRoot, ["merge-base", "--is-ancestor", refactorSha, "HEAD"]);
    const prefix = path.relative(repositoryRoot, exerciseRoot).split(path.sep).join("/");
    const characterizationFiles = [`${prefix}/evidence/before-output.json`, `${prefix}/rules-refactor-app/src/rules/legacyEligibility.characterization.test.mjs`].sort();
    const actualCharacterization = git(repositoryRoot, ["diff-tree", "--no-commit-id", "--name-only", "-r", characterizationSha]).split(/\r?\n/).filter(Boolean).sort();
    if (JSON.stringify(actualCharacterization) !== JSON.stringify(characterizationFiles)) failures.push("characterizationSha must contain only public characterization test and before output");
    const testSource = execFileSync("git", ["show", `${characterizationSha}:${characterizationFiles[1]}`], { cwd: repositoryRoot, encoding: "utf8" });
    if (!testSource.includes("evaluateRenewalEligibility") || /from\s+["'][^"']*(helper|internal)/i.test(testSource)) failures.push("characterization test must use only the public rule export");
    const refactorFile = `${prefix}/rules-refactor-app/src/rules/legacyEligibility.mjs`;
    const actualRefactor = git(repositoryRoot, ["diff-tree", "--no-commit-id", "--name-only", "-r", refactorSha]).split(/\r?\n/).filter(Boolean);
    if (actualRefactor.length !== 1 || actualRefactor[0] !== refactorFile) failures.push("refactorSha must change only legacyEligibility.mjs");
    const later = git(repositoryRoot, ["diff", "--name-only", refactorSha, "HEAD"]).split(/\r?\n/).filter(Boolean);
    for (const file of later) if (!file.startsWith(`${prefix}/evidence/`)) failures.push(`commit after refactorSha changes non-evidence file ${file}`);
  } catch { failures.push("characterizationSha must precede a focused ancestor refactorSha"); }
  return failures;
}

export function verifyOutputs(before, after, cases) {
  const failures = [];
  if (JSON.stringify(before) !== JSON.stringify(after)) failures.push("before and after outputs are not identical");
  if (!Array.isArray(before) || before.length !== cases.length) failures.push("output snapshots must cover every golden case");
  for (let index = 0; index < cases.length; index += 1) {
    if (before?.[index]?.name !== cases[index].name || JSON.stringify(before?.[index]?.input) !== JSON.stringify(cases[index].input) || JSON.stringify(before?.[index]?.output) !== JSON.stringify(cases[index].expected)) failures.push(`snapshot mismatch for ${cases[index].name}`);
  }
  return failures;
}

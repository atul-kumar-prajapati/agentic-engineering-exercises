import path from "node:path";
import fs from "node:fs";
import { execFileSync } from "node:child_process";

function git(root, args) { return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim(); }
export function parseNumstat(source) {
  const rows = source.split(/\r?\n/).filter(Boolean).map((line) => {
    const [added, deleted, file] = line.split("\t");
    if (!/^\d+$/.test(added) || !/^\d+$/.test(deleted) || !file) throw new Error(`non-text or invalid numstat row: ${line}`);
    return { file, additions: Number(added), deletions: Number(deleted) };
  });
  return { rows, files: rows.length, additions: rows.reduce((sum, row) => sum + row.additions, 0), deletions: rows.reduce((sum, row) => sum + row.deletions, 0), changedLines: rows.reduce((sum, row) => sum + row.additions + row.deletions, 0) };
}

export function verifyScopeHistory({ repositoryRoot, exerciseRoot, planSha, sourceSha, ledger }) {
  const failures = [];
  try {
    git(repositoryRoot, ["merge-base", "--is-ancestor", planSha, sourceSha]);
    git(repositoryRoot, ["merge-base", "--is-ancestor", sourceSha, "HEAD"]);
    if (git(repositoryRoot, ["rev-parse", `${sourceSha}^`]) !== planSha) failures.push("sourceSha must be the direct child of planSha");
    const prefix = path.relative(repositoryRoot, exerciseRoot).split(path.sep).join("/");
    const planFiles = [`${prefix}/evidence/scope-plan.json`, `${prefix}/evidence/scope-plan.md`].sort();
    const actualPlan = git(repositoryRoot, ["diff-tree", "--no-commit-id", "--name-only", "-r", planSha]).split(/\r?\n/).filter(Boolean).sort();
    if (JSON.stringify(planFiles) !== JSON.stringify(actualPlan)) failures.push("planSha must contain only scope-plan.json and scope-plan.md");
    for (const file of planFiles) {
      const relative = file.slice(prefix.length + 1);
      const committed = git(repositoryRoot, ["show", `${planSha}:${file}`]).replaceAll("\r\n", "\n").trimEnd();
      const current = fs.readFileSync(path.join(exerciseRoot, relative), "utf8").replaceAll("\r\n", "\n").trimEnd();
      if (current !== committed) failures.push(`${relative} must remain byte-for-byte equal to the planSha version`);
    }
    const sourceFiles = [`${prefix}/minimal-diff-app/src/migration/exportButton.mjs`, `${prefix}/minimal-diff-app/tests/export-button.test.mjs`].sort();
    const actualSource = git(repositoryRoot, ["diff-tree", "--no-commit-id", "--name-only", "-r", sourceSha]).split(/\r?\n/).filter(Boolean).sort();
    if (JSON.stringify(sourceFiles) !== JSON.stringify(actualSource)) failures.push("sourceSha must contain only the export helper and learner test");
    const stats = parseNumstat(git(repositoryRoot, ["diff", "--numstat", planSha, sourceSha]));
    if (stats.files > 2 || stats.changedLines > 30) failures.push("source commit exceeds two files or 30 changed lines");
    if (stats.changedLines > 20 && (typeof ledger?.lineJustification !== "string" || ledger.lineJustification.trim().length < 50)) failures.push("source commit above 20 changed lines needs a concrete lineJustification");
    for (const field of ["files", "additions", "deletions", "changedLines"]) if (ledger?.actual?.[field] !== stats[field]) failures.push(`ledger actual ${field} does not match Git`);
    const later = git(repositoryRoot, ["diff", "--name-only", sourceSha, "HEAD"]).split(/\r?\n/).filter(Boolean);
    for (const file of later) if (!file.startsWith(`${prefix}/evidence/`)) failures.push(`commit after sourceSha changes non-evidence file ${file}`);
  } catch (error) { failures.push(`scope history could not be verified: ${error.message}`); }
  return failures;
}

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { verifyScopeHistory } from "./scope-verification.mjs";

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const repositoryRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: appRoot, encoding: "utf8" }).trim();
const evidenceRoot = path.join(exerciseRoot, "evidence");
const failures = [];
function json(file, label) { try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { failures.push(`missing or invalid ${label}`); return null; } }
const plan = json(path.join(evidenceRoot, "scope-plan.json"), "scope plan");
const ledger = json(path.join(evidenceRoot, "scope-budget.json"), "scope budget");
if (plan?.schemaVersion !== 1 || ledger?.schemaVersion !== 1) failures.push("plan and ledger schemaVersion must be 1");
if (plan?.maximumFiles !== 2 || plan?.maximumChangedLines !== 40) failures.push("pre-change plan must declare two files and 40 changed lines");
const allowed = ["minimal-diff-app/src/migration/exportButton.mjs", "minimal-diff-app/tests/export-button.test.mjs"].sort();
if (JSON.stringify([...(plan?.allowedSourceFiles ?? [])].sort()) !== JSON.stringify(allowed)) failures.push("plan allowedSourceFiles do not match the scope contract");
if (!Array.isArray(plan?.excludedPaths) || !["src/components", "src/styles.css", "package.json"].every((value) => plan.excludedPaths.includes(value))) failures.push("plan must explicitly exclude components, styles, and package changes");
if (ledger?.planned?.files !== 2 || ledger?.planned?.changedLines !== 40) failures.push("final ledger must preserve planned budget");
for (const field of ["planSha", "sourceSha"]) if (!/^[a-f0-9]{40}$/.test(ledger?.[field] ?? "")) failures.push(`${field} must be a full commit SHA`);
if (ledger?.planSha && ledger?.sourceSha) failures.push(...verifyScopeHistory({ repositoryRoot, exerciseRoot, planSha: ledger.planSha, sourceSha: ledger.sourceSha, ledger }));
for (const [file, terms] of [
  ["scope-plan.md", ["before", "two", "40", "exportButton.mjs", "export-button.test.mjs", "excluded"]],
  ["avoided-work.md", ["checkout", "destructive", "shared", "styles", "cleanup", "reason"]],
  ["verification.md", ["export", "checkout", "delete", "unknown", "pass", "exit code: 0"]],
]) {
  const text = fs.existsSync(path.join(evidenceRoot, file)) ? fs.readFileSync(path.join(evidenceRoot, file), "utf8").toLowerCase() : "";
  for (const term of terms) if (!text.includes(term.toLowerCase())) failures.push(`${file} is missing ${term}`);
}
if (failures.length) {
  console.error(`Scope submission verification failed:\n${[...new Set(failures)].map((failure) => `- ${failure}`).join("\n")}`);
  process.exit(1);
}
console.log(`Plan SHA: ${ledger.planSha}`);
console.log(`Source SHA: ${ledger.sourceSha}`);
console.log(`Actual scope: ${ledger.actual.files} files, ${ledger.actual.changedLines} changed lines`);
console.log("PASS scope budget was committed before implementation");
console.log("PASS actual Git numstat matches the final ledger and protected budget");
console.log("PASS source commit contains only export helper and learner test");
console.log("PASS later history contains evidence only");

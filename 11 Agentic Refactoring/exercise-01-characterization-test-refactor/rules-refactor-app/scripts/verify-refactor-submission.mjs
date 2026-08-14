import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { verifyOutputs, verifyRefactorHistory } from "./refactor-verification.mjs";

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const repositoryRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: appRoot, encoding: "utf8" }).trim();
const evidenceRoot = path.join(exerciseRoot, "evidence");
const failures = [];
function json(file, label) { try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { failures.push(`missing or invalid ${label}`); return null; } }
const cases = json(path.join(exerciseRoot, "docs", "renewal-golden-cases.json"), "golden cases") ?? [];
const before = json(path.join(evidenceRoot, "before-output.json"), "before output");
const after = json(path.join(evidenceRoot, "after-output.json"), "after output");
const history = json(path.join(evidenceRoot, "history.json"), "history evidence");
if (before && after) failures.push(...verifyOutputs(before, after, cases));
for (const field of ["characterizationSha", "refactorSha"]) if (!/^[a-f0-9]{40}$/.test(history?.[field] ?? "")) failures.push(`${field} must be a full commit SHA`);
if (history?.characterizationSha && history?.refactorSha) failures.push(...verifyRefactorHistory({ repositoryRoot, exerciseRoot, characterizationSha: history.characterizationSha, refactorSha: history.refactorSha }));
for (const [file, terms] of [
  ["behavior-decisions.md", ["preserve", "suspected bug", "support override", "negative", "plan-not-supported", "payment-history"]],
  ["refactor-steps.md", ["characterization", "before", "green", "refactor", "after", "command", "exit code: 0"]],
]) {
  const text = fs.existsSync(path.join(evidenceRoot, file)) ? fs.readFileSync(path.join(evidenceRoot, file), "utf8").toLowerCase() : "";
  for (const term of terms) if (!text.includes(term.toLowerCase())) failures.push(`${file} is missing ${term}`);
}
if (failures.length) {
  console.error(`Refactor submission verification failed:\n${[...new Set(failures)].map((failure) => `- ${failure}`).join("\n")}`);
  process.exit(1);
}
console.log(`Characterization SHA: ${history.characterizationSha}`);
console.log(`Refactor SHA: ${history.refactorSha}`);
console.log("PASS characterization test and before output preceded production edits");
console.log("PASS all ten before and after public outputs are identical");
console.log("PASS refactor commit changes only the legacy rule module");
console.log("PASS suspected bugs documented and later history limited to evidence");

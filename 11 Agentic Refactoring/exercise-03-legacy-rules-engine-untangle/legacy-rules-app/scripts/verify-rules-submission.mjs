import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { validateSnapshots, verifyRulesHistory } from "./rules-refactor-verification.mjs";

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const repositoryRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: appRoot, encoding: "utf8" }).trim();
const evidenceRoot = path.join(exerciseRoot, "evidence");
const failures = [];
function json(file, label) { try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { failures.push(`missing or invalid ${label}`); return null; } }
const expected = json(path.join(exerciseRoot, "docs/contract-observations.json"), "protected observations");
const before = json(path.join(evidenceRoot, "contract-before.json"), "before snapshot");
const after = json(path.join(evidenceRoot, "contract-after.json"), "after snapshot");
const history = json(path.join(evidenceRoot, "history.json"), "history evidence") ?? {};
if (before && after && expected) failures.push(...validateSnapshots(before, after, expected));
for (const field of ["characterizationSha", "refactorSha"]) if (!/^[a-f0-9]{40}$/.test(history[field] ?? "")) failures.push(`${field} must be a full commit SHA`);
if (history.characterizationSha && history.refactorSha) failures.push(...verifyRulesHistory({ repositoryRoot, exerciseRoot, ...history }));
for (const [file, terms] of [
  ["refactor-map.md", ["lookup", "DecisionPolicy", "validation", "construction", "persistence", "WorkflowService"]],
  ["rollback.md", ["revert", "DecisionPolicy", "WorkflowService", "contract", "repository"]],
]) {
  const content = fs.existsSync(path.join(evidenceRoot, file)) ? fs.readFileSync(path.join(evidenceRoot, file), "utf8") : "";
  for (const term of terms) if (!content.toLowerCase().includes(term.toLowerCase())) failures.push(`${file} is missing ${term}`);
}
if (failures.length) {
  console.error(`Rules extraction verification failed:\n${[...new Set(failures)].map((failure) => `- ${failure}`).join("\n")}`);
  process.exit(1);
}
console.log(`Characterization SHA: ${history.characterizationSha}`);
console.log(`Refactor SHA: ${history.refactorSha}`);
console.log("PASS identical contract snapshots and test-first focused history");

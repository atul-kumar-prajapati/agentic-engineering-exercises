import fs from "node:fs";
import path from "node:path";
import { readSkill, sha256, validateCandidateSkill } from "./trigger-evaluation.mjs";

const root = process.cwd();
const cases = JSON.parse(fs.readFileSync(path.join(root, "evals", "trigger-evals.json"), "utf8")).cases;
const baseline = readSkill(path.join(root, "fixtures", "change-review-baseline", "SKILL.md"));
const candidate = readSkill(path.join(root, "skills", "change-review", "SKILL.md"));
const failures = validateCandidateSkill(candidate, baseline, cases);

console.log(`Original description SHA-256: ${sha256(baseline.description)}`);
console.log(`Current description SHA-256:  ${sha256(candidate.description)}`);
if (failures.length) {
  console.error("Skill validation failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}
console.log("The change-review description has explicit boundaries, keeps the skill body unchanged, and avoids held-out phrase leakage.");

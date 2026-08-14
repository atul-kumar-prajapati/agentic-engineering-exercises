import fs from "node:fs";
import { readSkill, sha256 } from "./trigger-evaluation.mjs";

const data = JSON.parse(fs.readFileSync("evals/trigger-evals.json", "utf8"));
if (data.skill_name !== "change-review" || !Array.isArray(data.cases)) throw new Error("invalid trigger eval file");
if (data.cases.length !== 20) throw new Error(`expected 20 cases, found ${data.cases.length}`);
const ids = new Set(data.cases.map((item) => item.id));
if (ids.size !== data.cases.length) throw new Error("trigger case IDs must be unique");
const prompts = new Set(data.cases.map((item) => item.prompt.toLowerCase()));
if (prompts.size !== data.cases.length) throw new Error("trigger prompts must be unique");
for (const [split, count] of [["train", 12], ["held-out", 8]]) {
  const cases = data.cases.filter((item) => item.split === split);
  if (cases.length !== count) throw new Error(`${split} needs exactly ${count} cases`);
  if (cases.filter((item) => item.expected).length !== count / 2) throw new Error(`${split} must contain equal positive and negative cases`);
}
for (const item of data.cases) {
  if (typeof item.expected !== "boolean") throw new Error(`${item.id} needs a boolean expected value`);
  if (typeof item.boundary !== "string" || item.boundary.length < 4) throw new Error(`${item.id} needs a named boundary`);
  if (typeof item.prompt !== "string" || item.prompt.length < 80) throw new Error(`${item.id} must be a substantive request of at least 80 characters`);
}
const baseline = readSkill("fixtures/change-review-baseline/SKILL.md");
const starter = readSkill("skills/change-review/SKILL.md");
if (baseline.name !== starter.name || baseline.description !== starter.description || baseline.body !== starter.body) throw new Error("starter change-review skill no longer matches the protected baseline");
console.log(`Trigger fixtures contain 12 training and 8 held-out requests. Baseline description SHA-256: ${sha256(baseline.description)}`);

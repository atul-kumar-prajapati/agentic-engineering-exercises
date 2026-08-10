import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const cases = JSON.parse(fs.readFileSync(path.join(root, "evals", "trigger-evals.json"), "utf8")).cases;
const readJson = (relative) => {
  const absolute = path.join(root, relative);
  if (!fs.existsSync(absolute)) {
    failures.push(`missing ${relative}`);
    return null;
  }
  try { return JSON.parse(fs.readFileSync(absolute, "utf8")); } catch { failures.push(`${relative} is invalid JSON`); return null; }
};
const before = readJson("results/before.json");
const after = readJson("results/after.json");
const validateRuns = (label, results) => {
  if (!Array.isArray(results)) return;
  for (const item of cases) {
    const runs = results.filter((result) => result.caseId === item.id);
    if (runs.length !== 3) failures.push(`${label} needs three runs for ${item.id}`);
    for (const run of runs) if (typeof run.triggered !== "boolean" || !run.model) failures.push(`${label} has an invalid result for ${item.id}`);
  }
};
validateRuns("before.json", before);
validateRuns("after.json", after);
const score = (results, split) => {
  const selected = cases.filter((item) => item.split === split);
  const correct = selected.flatMap((item) => results.filter((result) => result.caseId === item.id).map((result) => result.triggered === item.expected)).filter(Boolean).length;
  return selected.length ? correct / (selected.length * 3) : 0;
};
if (Array.isArray(before) && Array.isArray(after) && !failures.length) {
  const beforeHeld = score(before, "held-out");
  const afterHeld = score(after, "held-out");
  if (afterHeld < 0.75) failures.push(`held-out score is below 0.75 (${afterHeld.toFixed(2)})`);
  if (afterHeld <= beforeHeld) failures.push(`held-out score did not improve (${beforeHeld.toFixed(2)} to ${afterHeld.toFixed(2)})`);
}
const skill = fs.readFileSync(path.join(root, "skills", "change-review", "SKILL.md"), "utf8");
const description = skill.match(/^description:\s*(.+)$/mi)?.[1] ?? "";
if (description.length < 120 || description.length > 700) failures.push("change-review description must express useful boundaries in 120 to 700 characters");
if (!/diff|pull request|branch|code change/i.test(description) || !/do not use|not for/i.test(description)) failures.push("description lacks positive or negative trigger boundaries");
for (const item of cases) if (description.includes(item.id) || description.includes(item.prompt.slice(0, 35))) failures.push(`description appears overfit to ${item.id}`);
const reportPath = path.join(root, "..", "evidence", "trigger-evaluation.md");
if (!fs.existsSync(reportPath)) failures.push("missing evidence/trigger-evaluation.md");
else {
  const report = fs.readFileSync(reportPath, "utf8").toLowerCase();
  for (const term of ["model", "three runs", "train", "held-out", "false positive", "false negative", "adoption decision"]) if (!report.includes(term)) failures.push(`trigger-evaluation.md is missing ${term}`);
}
if (failures.length) {
  console.error("Trigger submission verification failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}
console.log("Trigger evaluation uses repeated train and held-out model decisions and improves the real description.");

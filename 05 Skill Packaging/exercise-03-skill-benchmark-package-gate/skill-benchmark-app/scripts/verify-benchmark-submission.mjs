import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const exerciseRoot = path.resolve(root, "..");
const failures = [];
const evals = JSON.parse(fs.readFileSync("evals/evals.json", "utf8")).evals;
const readJson = (relative) => {
  const absolute = path.join(root, relative);
  if (!fs.existsSync(absolute)) { failures.push(`missing ${relative}`); return null; }
  try { return JSON.parse(fs.readFileSync(absolute, "utf8")); } catch { failures.push(`${relative} is invalid JSON`); return null; }
};
const baseline = readJson("results/baseline.json");
const withSkill = readJson("results/with-skill.json");
const validate = (label, values) => {
  if (!Array.isArray(values)) return;
  for (const item of evals) {
    const runs = values.filter((run) => run.evalId === item.id);
    if (runs.length !== 3) failures.push(`${label} needs three runs for eval ${item.id}`);
    for (const run of runs) {
      if (!run.model || !Number.isFinite(run.inputTokens) || !Number.isFinite(run.outputTokens) || !Number.isFinite(run.elapsedMs)) failures.push(`${label} run for eval ${item.id} lacks model, token, or time metrics`);
      for (const expectation of item.expectations) if (typeof run.assertions?.[expectation.id] !== "boolean") failures.push(`${label} run for eval ${item.id} lacks assertion ${expectation.id}`);
    }
  }
};
validate("baseline", baseline);
validate("with-skill", withSkill);
const passRate = (values, split, criticalOnly = false) => {
  const selected = evals.filter((item) => item.split === split);
  const assertions = selected.flatMap((item) => item.expectations.filter((expectation) => !criticalOnly || expectation.critical).flatMap((expectation) => values.filter((run) => run.evalId === item.id).map((run) => run.assertions?.[expectation.id] === true)));
  return assertions.length ? assertions.filter(Boolean).length / assertions.length : 0;
};
if (Array.isArray(baseline) && Array.isArray(withSkill) && !failures.length) {
  if (passRate(withSkill, "held-out") <= passRate(baseline, "held-out")) failures.push("with-skill held-out quality does not improve over baseline");
  if (passRate(withSkill, "held-out", true) < passRate(baseline, "held-out", true)) failures.push("a critical held-out assertion regressed");
}
const benchmarkPath = path.join(exerciseRoot, "evidence", "benchmark.json");
const reportPath = path.join(exerciseRoot, "evidence", "benchmark.md");
for (const [file, terms] of [[benchmarkPath, []], [reportPath, ["quality", "variance", "token", "elapsed", "held-out", "adoption"]]]) {
  if (!fs.existsSync(file)) failures.push(`missing ${path.relative(exerciseRoot, file)}`);
  else for (const term of terms) if (!fs.readFileSync(file, "utf8").toLowerCase().includes(term)) failures.push(`benchmark.md is missing ${term}`);
}
const archive = path.join(exerciseRoot, "dist", "incident-summary.skill");
if (!fs.existsSync(archive)) failures.push("missing dist/incident-summary.skill");
else {
  const bytes = fs.readFileSync(archive);
  if (bytes.length < 200 || bytes[0] !== 0x50 || bytes[1] !== 0x4b || !bytes.includes(Buffer.from("SKILL.md"))) failures.push("incident-summary.skill is not a valid skill archive containing SKILL.md");
}
if (failures.length) {
  console.error("Benchmark submission verification failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}
console.log("Repeated baseline and skill runs pass the held-out quality and package gate.");

import fs from "node:fs";
import path from "node:path";
import { routeTask } from "../src/routing/routeTask.mjs";
import { buildRoutingScorecard } from "./routing-verification.mjs";

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const evidenceRoot = path.join(exerciseRoot, "evidence");
const cases = JSON.parse(fs.readFileSync(path.join(exerciseRoot, "evals", "routing-cases.json"), "utf8"));
const packText = fs.readFileSync(path.join(exerciseRoot, "evals", "recorded-runs.json"), "utf8");
const inputs = {
  cases,
  pricing: JSON.parse(fs.readFileSync(path.join(exerciseRoot, "evals", "pricing.json"), "utf8")),
  pack: JSON.parse(packText),
  packText,
  measurements: JSON.parse(fs.readFileSync(path.join(evidenceRoot, "routing-measurements.json"), "utf8")),
  metadata: JSON.parse(fs.readFileSync(path.join(evidenceRoot, "measurement-run.json"), "utf8")),
  decisions: cases.map((item) => ({ id: item.id, route: routeTask(item) })),
};
const { failures, scorecard } = buildRoutingScorecard(inputs);
fs.writeFileSync(path.join(evidenceRoot, "cost-model.json"), `${JSON.stringify(scorecard, null, 2)}\n`);
if (failures.length) {
  console.error(`Routing scoring failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
  process.exit(1);
}
console.log(JSON.stringify(scorecard.totals, null, 2));
for (const [gate, passed] of Object.entries(scorecard.gates)) console.log(`${passed ? "PASS" : "FAIL"} ${gate}`);
console.log(`Decision: ${scorecard.adoption}`);
if (scorecard.adoption !== "adopt") process.exit(1);

import fs from "node:fs";
import path from "node:path";
import { buildScorecard } from "./review-eval-verification.mjs";

const appRoot = process.cwd();
const evidenceRoot = path.resolve(appRoot, "..", "evidence");
const cases = JSON.parse(fs.readFileSync(path.join(appRoot, "eval", "cases.json"), "utf8"));
const skillSource = fs.readFileSync(path.join(appRoot, "skills", "regression-review", "SKILL.md"), "utf8");
const runnerSource = fs.readFileSync(path.join(appRoot, "scripts", "run-review-session.mjs"), "utf8");
const { failures, scorecard } = buildScorecard({ evidenceRoot, cases, skillSource, runnerSource });
fs.mkdirSync(evidenceRoot, { recursive: true });
fs.writeFileSync(path.join(evidenceRoot, "scorecard.json"), `${JSON.stringify(scorecard, null, 2)}\n`);
if (failures.length) {
  console.error(`Review skill scoring failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
  process.exit(1);
}
console.log(JSON.stringify(scorecard.metrics, null, 2));
console.log(`Decision: ${scorecard.decision}`);
if (scorecard.decision !== "adopt") process.exit(1);

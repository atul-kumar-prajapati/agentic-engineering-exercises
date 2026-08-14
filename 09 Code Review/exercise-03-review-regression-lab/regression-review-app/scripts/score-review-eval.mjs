import fs from "node:fs";
import path from "node:path";
import { buildScorecard } from "./review-eval-verification.mjs";

const appRoot = process.cwd();
const evidenceRoot = path.resolve(appRoot, "..", "evidence");
const rawPath = path.join(evidenceRoot, "raw-results.json");
const rawText = fs.readFileSync(rawPath, "utf8");
const inputs = {
  rawDocument: JSON.parse(rawText), rawText,
  judgments: JSON.parse(fs.readFileSync(path.join(evidenceRoot, "judgments.json"), "utf8")),
  cases: JSON.parse(fs.readFileSync(path.join(appRoot, "eval", "cases.json"), "utf8")),
  run: JSON.parse(fs.readFileSync(path.join(evidenceRoot, "run.json"), "utf8")),
  baselinePrompt: fs.readFileSync(path.join(appRoot, "eval", "review-prompt-before.md"), "utf8"),
  candidatePrompt: fs.readFileSync(path.join(appRoot, "eval", "review-prompt-candidate.md"), "utf8"),
};
const { failures, scorecard } = buildScorecard(inputs);
fs.writeFileSync(path.join(evidenceRoot, "scorecard.json"), `${JSON.stringify(scorecard, null, 2)}\n`);
if (failures.length) {
  console.error(`Review eval scoring failed:\n${[...new Set(failures)].map((failure) => `- ${failure}`).join("\n")}`);
  process.exit(1);
}
console.log(JSON.stringify(scorecard.metrics, null, 2));
console.log(`Decision: ${scorecard.adoption}`);
for (const [gate, passed] of Object.entries(scorecard.gates)) console.log(`${passed ? "PASS" : "FAIL"} ${gate}`);
if (scorecard.adoption !== "adopt") process.exit(1);

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { buildScorecard, verifyPromptGitBinding } from "./review-eval-verification.mjs";

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const evidenceRoot = path.join(exerciseRoot, "evidence");
const repositoryRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: appRoot, encoding: "utf8" }).trim();
const failures = [];
function read(file, label) { try { return fs.readFileSync(file, "utf8"); } catch { failures.push(`missing ${label}`); return ""; } }
function json(file, label) { try { return JSON.parse(read(file, label)); } catch { failures.push(`invalid ${label}`); return null; } }
const rawText = read(path.join(evidenceRoot, "raw-results.json"), "raw Promptfoo results");
const run = json(path.join(evidenceRoot, "run.json"), "run metadata");
let rawDocument = {};
try { rawDocument = JSON.parse(rawText); }
catch { failures.push("invalid raw Promptfoo results"); }
const inputs = {
  rawDocument, rawText,
  judgments: json(path.join(evidenceRoot, "judgments.json"), "response judgments") ?? [],
  cases: json(path.join(appRoot, "eval", "cases.json"), "protected cases") ?? [],
  run,
  baselinePrompt: read(path.join(appRoot, "eval", "review-prompt-before.md"), "baseline prompt"),
  candidatePrompt: read(path.join(appRoot, "eval", "review-prompt-candidate.md"), "candidate prompt"),
};
const built = buildScorecard(inputs);
failures.push(...built.failures);
const stored = json(path.join(evidenceRoot, "scorecard.json"), "generated scorecard");
if (stored && JSON.stringify(stored) !== JSON.stringify(built.scorecard)) failures.push("stored scorecard does not match raw results and judgments");
if (built.scorecard.adoption !== "adopt") failures.push("scorecard does not pass every adoption gate");
const report = read(path.join(evidenceRoot, "review-eval.md"), "evaluation report").toLowerCase();
for (const [name, value] of Object.entries(built.scorecard.metrics.candidate)) {
  if (typeof value === "number" && !report.includes(`${(value * 100).toFixed(1)}%`.toLowerCase())) failures.push(`report is missing exact candidate ${name}`);
}
for (const term of ["variance", "false blocker", "limitation", "adopt", run?.provider]) if (term && !report.includes(String(term).toLowerCase())) failures.push(`report is missing ${term}`);
if (run?.candidatePromptSourceSha) failures.push(...verifyPromptGitBinding({ repositoryRoot, exerciseRoot, sourceSha: run.candidatePromptSourceSha, candidatePromptSha256: built.scorecard.candidatePromptSha256 }));
if (failures.length) {
  console.error(`Review eval verification failed:\n${[...new Set(failures)].map((failure) => `- ${failure}`).join("\n")}`);
  process.exit(1);
}
console.log(`Source SHA: ${run.candidatePromptSourceSha}`);
console.log("PASS 18 uncached real-model responses bound to one provider and configuration");
console.log("PASS response judgments match raw SHA-256 values");
console.log("PASS recall, precision, variance, and regression metrics recomputed");
console.log("PASS all prompt adoption thresholds satisfied");
console.log("PASS candidate prompt source and evidence-only history verified");

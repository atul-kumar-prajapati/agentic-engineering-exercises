import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { buildScorecard, verifySkillContents, verifySkillGitBinding } from "./review-eval-verification.mjs";

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const evidenceRoot = path.join(exerciseRoot, "evidence");
const repositoryRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: appRoot, encoding: "utf8" }).trim();
const failures = [];
const cases = JSON.parse(fs.readFileSync(path.join(appRoot, "eval", "cases.json"), "utf8"));
const skillSource = fs.readFileSync(path.join(appRoot, "skills", "regression-review", "SKILL.md"), "utf8");
const runnerSource = fs.readFileSync(path.join(appRoot, "scripts", "run-review-session.mjs"), "utf8");
const skillRoot = path.join(appRoot, "skills", "regression-review");
function packageFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? packageFiles(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
}
const supportingSources = packageFiles(skillRoot).filter((file) => path.basename(file) !== "SKILL.md").map((file) => fs.readFileSync(file, "utf8"));
const diffSources = cases.map((item) => fs.readFileSync(path.resolve(appRoot, "eval", item.diff), "utf8"));
failures.push(...verifySkillContents(skillSource, { supportingSources, cases, diffSources }));
const built = buildScorecard({ evidenceRoot, cases, skillSource, runnerSource });
failures.push(...built.failures);
let stored;
try { stored = JSON.parse(fs.readFileSync(path.join(evidenceRoot, "scorecard.json"), "utf8")); }
catch { failures.push("missing or invalid evidence/scorecard.json"); }
if (stored && JSON.stringify(stored) !== JSON.stringify(built.scorecard)) failures.push("stored scorecard does not match the six raw runs");
if (built.scorecard.decision !== "adopt") failures.push("scorecard does not pass every adoption gate");
const beforeRuns = cases.map((item) => JSON.parse(fs.readFileSync(path.join(evidenceRoot, "runs", "before", `${item.id}.json`), "utf8")));
const afterRuns = cases.map((item) => JSON.parse(fs.readFileSync(path.join(evidenceRoot, "runs", "after", `${item.id}.json`), "utf8")));
const beforeSourceShas = [...new Set(beforeRuns.map((run) => run.sourceSha))];
const beforeMarkdown = fs.readFileSync(path.join(evidenceRoot, "before.md"), "utf8");
const startingCommit = beforeMarkdown.match(/^\s*(?:[-*]\s*)?Starting commit:\s*`?([a-f0-9]{40})`?\s*$/mi)?.[1];
if (beforeSourceShas.length !== 1 || beforeSourceShas[0] !== startingCommit) failures.push("all baseline runs must be captured at the recorded starting commit");
const sourceShas = [...new Set(afterRuns.map((run) => run.sourceSha))];
if (sourceShas.length !== 1) failures.push("all skill-assisted runs must use one skill source SHA");
else failures.push(...verifySkillGitBinding({ repositoryRoot, exerciseRoot, sourceSha: sourceShas[0], skillSha256: built.scorecard.skillSha256 }));
const reportPath = path.join(evidenceRoot, "review-eval.md");
const report = fs.existsSync(reportPath) ? fs.readFileSync(reportPath, "utf8").toLowerCase() : "";
for (const term of ["baseline", "skill-assisted", "coverage", "precision", "clean control", "decision", built.scorecard.decision]) if (!report.includes(term)) failures.push(`review-eval.md is missing ${term}`);
if (failures.length) {
  console.error(`Review skill verification failed:\n${[...new Set(failures)].map((failure) => `- ${failure}`).join("\n")}`);
  process.exit(1);
}
console.log("PASS six runner-captured review sessions use matching conditions and unique nonces");
console.log("PASS every run is bound to its prompt, protected diff, source commit, and transcript");
console.log("PASS skill contains no case answers and requires no API key");
console.log(`Decision: ${built.scorecard.decision}`);

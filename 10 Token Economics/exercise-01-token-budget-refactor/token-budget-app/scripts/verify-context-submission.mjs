import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { selectContext } from "../src/budget/selectContext.mjs";
import { verifyContextEvidence, verifyContextHistory } from "./context-verification.mjs";

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const repositoryRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: appRoot, encoding: "utf8" }).trim();
const evidenceRoot = path.join(exerciseRoot, "evidence");
const failures = [];
function readJson(file, label) { try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { failures.push(`missing or invalid ${label}`); return null; } }
const plan = readJson(path.join(evidenceRoot, "context-plan.json"), "context plan");
const ledger = readJson(path.join(evidenceRoot, "context-ledger.json"), "context ledger");
const catalog = readJson(path.join(exerciseRoot, "docs", "context-catalog.json"), "context catalog") ?? [];
function recordedBytes(lane) {
  const file = path.join(evidenceRoot, `${lane}.md`);
  const source = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  return Number(source.match(/^\|\s*Total UTF-8 bytes\s*\|\s*(\d+)\s*\|\s*$/mi)?.[1]);
}
let expectedResult = null;
if (plan) {
  try { expectedResult = selectContext(catalog, { tags: plan.task.tags, questions: plan.task.questionTags }, plan.maximumBytes); }
  catch (error) { failures.push(`planned selector run failed: ${error.message}`); }
}
if (plan && ledger && expectedResult) failures.push(...verifyContextEvidence({ plan, ledger, catalog, expectedResult }));
const fullContextBytes = catalog.reduce((sum, item) => sum + item.bytes, 0);
if (recordedBytes("before") !== fullContextBytes) failures.push(`before.md must record the complete protected context cost of ${fullContextBytes} bytes`);
if (expectedResult && recordedBytes("after") !== expectedResult.totalBytes) failures.push(`after.md must record the reproduced selected-context cost of ${expectedResult.totalBytes} bytes`);
if (expectedResult && expectedResult.totalBytes >= fullContextBytes) failures.push("selected context does not reduce the protected full-context cost");
const planMarkdown = fs.existsSync(path.join(evidenceRoot, "context-plan.md")) ? fs.readFileSync(path.join(evidenceRoot, "context-plan.md"), "utf8").toLowerCase() : "";
for (const term of ["before", "maximum", "mandatory", "authority", "open question", ...(plan?.expectedSelectedIds ?? [])]) if (!planMarkdown.includes(String(term).toLowerCase())) failures.push(`context-plan.md is missing ${term}`);
const decision = fs.existsSync(path.join(evidenceRoot, "decision.md")) ? fs.readFileSync(path.join(evidenceRoot, "decision.md"), "utf8").toLowerCase() : "";
for (const term of ["planned", "actual", "expanded", "stale", "verification", "correctness", "trade-off", String(expectedResult?.totalBytes ?? "")]) if (term && !decision.includes(term.toLowerCase())) failures.push(`decision.md is missing ${term}`);
if (ledger?.planSha && ledger?.sourceSha) failures.push(...verifyContextHistory({ repositoryRoot, exerciseRoot, planSha: ledger.planSha, sourceSha: ledger.sourceSha }));
if (failures.length) {
  console.error(`Context submission verification failed:\n${[...new Set(failures)].map((failure) => `- ${failure}`).join("\n")}`);
  process.exit(1);
}
console.log(`Plan SHA: ${ledger.planSha}`);
console.log(`Source SHA: ${ledger.sourceSha}`);
console.log(`Selected bytes: ${expectedResult.totalBytes}/${expectedResult.maximumBytes}`);
console.log(`Context reduction: ${fullContextBytes - expectedResult.totalBytes} bytes`);
console.log("PASS pre-change budget plan precedes implementation");
console.log("PASS ledger exactly matches deterministic selector output and real source costs");
console.log("PASS every context source has a selected or skipped reason");
console.log("PASS focused selector history and evidence-only follow-up verified");

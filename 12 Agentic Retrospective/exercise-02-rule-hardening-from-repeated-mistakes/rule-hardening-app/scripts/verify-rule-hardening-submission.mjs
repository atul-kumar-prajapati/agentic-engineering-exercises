import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { applyAndGradePatch, sha256, validateGuidance, verifyRuleHistory } from "./rule-hardening-verification.mjs";

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const repositoryRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: appRoot, encoding: "utf8" }).trim();
const evidenceRoot = path.join(exerciseRoot, "evidence");
const failures = [];
function json(file, label) { try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { failures.push(`missing or invalid ${label}`); return null; } }
const agents = fs.existsSync(path.join(exerciseRoot, "AGENTS.md")) ? fs.readFileSync(path.join(exerciseRoot, "AGENTS.md"), "utf8") : "";
const persistence = fs.existsSync(path.join(exerciseRoot, ".agent/persistence.md")) ? fs.readFileSync(path.join(exerciseRoot, ".agent/persistence.md"), "utf8") : "";
const corrections = json(path.join(exerciseRoot, "docs/correction-history.json"), "correction history") ?? [];
failures.push(...validateGuidance(agents, persistence, corrections));
const beforeMetadata = json(path.join(evidenceRoot, "before-metadata.json"), "before metadata") ?? {};
const afterMetadata = json(path.join(evidenceRoot, "after-metadata.json"), "after metadata") ?? {};
for (const field of ["agent", "model", "promptHash", "timeLimitMinutes"]) if (beforeMetadata[field] !== afterMetadata[field]) failures.push(`agent runs changed ${field}`);
if (!beforeMetadata.sessionId || !afterMetadata.sessionId || beforeMetadata.sessionId === afterMetadata.sessionId) failures.push("before and after need different non-empty session IDs");
for (const metadata of [beforeMetadata, afterMetadata]) {
  if (metadata.firstAttempt !== true || metadata.edited !== false) failures.push("each patch must be an unedited first attempt");
}
const history = json(path.join(evidenceRoot, "history.json"), "history evidence") ?? {};
for (const field of ["baselineSha", "rulesSha", "implementationSha"]) if (!/^[a-f0-9]{40}$/.test(history[field] ?? "")) failures.push(`${field} must be a full commit SHA`);
if (beforeMetadata.repositorySha !== history.baselineSha) failures.push("before run must use baselineSha");
if (afterMetadata.repositorySha !== history.rulesSha) failures.push("after run must use rulesSha");
if (history.baselineSha && history.rulesSha && history.implementationSha) failures.push(...verifyRuleHistory({ repositoryRoot, exerciseRoot, ...history }));
let beforeGrade;
let afterGrade;
const starterPath = path.join(exerciseRoot, "fixtures/filterPersistence.starter.mjs");
try { beforeGrade = await applyAndGradePatch({ patchPath: path.join(evidenceRoot, "before.patch"), starterPath }); } catch (error) { failures.push(`before patch cannot be graded: ${error.message}`); }
try { afterGrade = await applyAndGradePatch({ patchPath: path.join(evidenceRoot, "after.patch"), starterPath }); } catch (error) { failures.push(`after patch cannot be graded: ${error.message}`); }
if (beforeGrade && beforeGrade.defects.length < 2) failures.push("before first attempt must reproduce at least two protected defects");
if (afterGrade && afterGrade.defects.length !== 0) failures.push(`after first attempt defects: ${afterGrade.defects.join(", ")}`);
if (beforeGrade && beforeMetadata.patchSha256 !== beforeGrade.patchSha256) failures.push("before patch hash does not match metadata");
if (afterGrade && afterMetadata.patchSha256 !== afterGrade.patchSha256) failures.push("after patch hash does not match metadata");
if (afterGrade && history.implementationSha) {
  const prefix = path.relative(repositoryRoot, exerciseRoot).split(path.sep).join("/");
  try {
    const finalSource = execFileSync("git", ["show", `${history.implementationSha}:${prefix}/rule-hardening-app/src/services/filterPersistence.mjs`], { cwd: repositoryRoot, encoding: "utf8" }).replaceAll("\r\n", "\n");
    if (finalSource !== afterGrade.source) failures.push("implementation source is not identical to the graded after patch");
    const starterAtRules = execFileSync("git", ["show", `${history.rulesSha}:${prefix}/rule-hardening-app/src/services/filterPersistence.mjs`], { cwd: repositoryRoot, encoding: "utf8" }).replaceAll("\r\n", "\n");
    const fixture = fs.readFileSync(starterPath, "utf8").replaceAll("\r\n", "\n");
    if (starterAtRules !== fixture) failures.push("rulesSha must retain the unchanged starter implementation");
  } catch { failures.push("unable to bind patches to rules and implementation commits"); }
}
for (const [file, terms] of [
  ["rule-map.md", ["COR-101", "COR-106", "identity-vs-presentation", "canonical-enum-storage", "ambient-time", "AGENTS.md", "persistence.md", "test:persistence"]],
  ["comparison.md", ["same task", "same agent", "same model", "first attempt", "baseline", "after", "rule", "defect", "verification"]],
]) {
  const content = fs.existsSync(path.join(evidenceRoot, file)) ? fs.readFileSync(path.join(evidenceRoot, file), "utf8") : "";
  for (const term of terms) if (!content.toLowerCase().includes(term.toLowerCase())) failures.push(`${file} is missing ${term}`);
}
if (failures.length) {
  console.error(`Rule hardening verification failed:\n${[...new Set(failures)].map((failure) => `- ${failure}`).join("\n")}`);
  process.exit(1);
}
console.log(`Rules SHA: ${history.rulesSha}`);
console.log(`Implementation SHA: ${history.implementationSha}`);
console.log(`PASS baseline defects ${beforeGrade.defects.length} -> after defects ${afterGrade.defects.length}`);
console.log(`PASS patch hashes ${sha256(fs.readFileSync(path.join(evidenceRoot, "before.patch"), "utf8"))} and ${sha256(fs.readFileSync(path.join(evidenceRoot, "after.patch"), "utf8"))}`);

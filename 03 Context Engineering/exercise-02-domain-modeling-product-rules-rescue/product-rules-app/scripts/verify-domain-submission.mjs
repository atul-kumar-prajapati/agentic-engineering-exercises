import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const failures = [];
const productPrompt = "Add AI-history export to the workspace settings page. Only an authorized administrator on an eligible workspace may export. Preserve the existing security and data-residency restrictions.";

function readRequired(relativePath) {
  const absolutePath = path.join(exerciseRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing required evidence file: ${relativePath}`);
    return "";
  }
  const content = fs.readFileSync(absolutePath, "utf8");
  if (!content.trim()) failures.push(`evidence file is empty: ${relativePath}`);
  return content;
}

function field(content, name) {
  return content.match(new RegExp(`^- ${name}:\\s*(.+)$`, "mi"))?.[1].trim() ?? "";
}

function sha256(absolutePath) {
  const normalized = fs.readFileSync(absolutePath, "utf8").replaceAll("\r\n", "\n");
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

function verifyStarterIntegrity() {
  const manifestPath = path.join(appRoot, "challenge-integrity.json");
  if (!fs.existsSync(manifestPath)) {
    failures.push("challenge integrity manifest is missing");
    return;
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  for (const [relativePath, expectedHash] of Object.entries(manifest.protectedFiles ?? {})) {
    const absolutePath = path.resolve(appRoot, relativePath);
    if (!fs.existsSync(absolutePath)) failures.push(`protected challenge file is missing: ${relativePath}`);
    else if (sha256(absolutePath) !== expectedHash) failures.push(`protected challenge file was changed: ${relativePath}`);
  }
}

function checkNoPlaceholders(relativePath, content) {
  for (const pattern of [
    /\b(?:TODO|TBD|FIXME)\b/i,
    /\[(?:name|model|enabled|permission|implementation|observed|replace|describe|explain)[^\]]*\]/i,
  ]) {
    if (pattern.test(content)) failures.push(`${relativePath} contains an instructional placeholder`);
  }
}

verifyStarterIntegrity();

const evidencePaths = [
  "CONTEXT.md",
  "docs/adr/0001-ai-history-export.md",
  "evidence/before.md",
  "evidence/before.patch",
  "evidence/domain-audit.md",
  "evidence/after.md",
  "evidence/after.patch",
  "evidence/comparison.md",
];
const evidence = Object.fromEntries(evidencePaths.map((relativePath) => [relativePath, readRequired(relativePath)]));

if (failures.some((failure) => failure.startsWith("missing required evidence"))) {
  console.error("Domain-model verification failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

for (const relativePath of [
  "CONTEXT.md",
  "docs/adr/0001-ai-history-export.md",
  "evidence/before.md",
  "evidence/domain-audit.md",
  "evidence/after.md",
  "evidence/comparison.md",
]) {
  checkNoPlaceholders(relativePath, evidence[relativePath]);
}

const before = evidence["evidence/before.md"];
const after = evidence["evidence/after.md"];
for (const name of ["Agent", "Model", "Tools", "Permissions", "Time limit", "Prompt", "Attempt"]) {
  const beforeValue = field(before, name);
  const afterValue = field(after, name);
  if (!beforeValue || !afterValue) failures.push(`before.md and after.md must both record ${name}`);
  if (beforeValue && afterValue && beforeValue.toLowerCase() !== afterValue.toLowerCase()) {
    failures.push(`before and after implementation conditions differ for ${name}`);
  }
}
if (field(before, "Prompt") !== productPrompt || field(after, "Prompt") !== productPrompt) {
  failures.push("before.md and after.md must record the exact product request");
}
if (field(before, "Attempt") !== "1" || field(after, "Attempt") !== "1") {
  failures.push("both implementation sessions must be recorded as first attempts");
}
if (!/(?:supplied|full).{0,30}repositor/i.test(field(before, "Context source"))) {
  failures.push("before.md must identify the supplied repository as its context source");
}
if (!/context\.md/i.test(field(after, "Context source"))) {
  failures.push("after.md must identify CONTEXT.md as its context source");
}
if (!/disabled/i.test(field(before, "Domain Modeling skill")) || !/enabled/i.test(field(after, "Domain Modeling skill"))) {
  failures.push("before.md and after.md must record the Domain Modeling skill boundary");
}

for (const [name, patch] of [
  ["before.patch", evidence["evidence/before.patch"]],
  ["after.patch", evidence["evidence/after.patch"]],
]) {
  if (!patch.includes("diff --git") || !patch.includes("@@") || patch.length < 300) {
    failures.push(`evidence/${name} must contain a genuine implementation patch`);
  }
  if (!patch.includes("aiHistoryExportPolicy.ts")) failures.push(`evidence/${name} must include the export policy change`);
}
if (evidence["evidence/before.patch"] === evidence["evidence/after.patch"]) {
  failures.push("before.patch and after.patch must show different implementations");
}

const context = evidence["CONTEXT.md"];
const contextWords = context.trim().split(/\s+/).filter(Boolean).length;
if (contextWords > 700) failures.push(`CONTEXT.md exceeds the 700-word glossary limit (${contextWords} words)`);
if (contextWords < 90) failures.push("CONTEXT.md is too small to define the domain vocabulary and relationships");
for (const required of [
  "billing customer",
  "workspace",
  "user",
  "membership",
  "role",
  "data residency",
  "same workspace",
]) {
  if (!context.toLowerCase().includes(required.toLowerCase())) failures.push(`CONTEXT.md is missing ${required}`);
}
if (!/billing.{0,30}ownership.{0,40}(?:does not|doesn't|never).{0,30}(?:access|export|grant)/i.test(context)) {
  failures.push("CONTEXT.md must state that billing ownership does not grant export access");
}
if (/Growth.{0,30}(?:eligible|allow|export)|account owner.{0,30}(?:eligible|allow|export)/i.test(context)) {
  failures.push("CONTEXT.md carries a superseded Growth or account-owner rule as current guidance");
}

const decision = evidence["docs/adr/0001-ai-history-export.md"];
for (const required of [
  "status",
  "decision",
  "consequences",
  "docs/current-access-policy.md",
  "docs/legacy-rollout-notes.md",
  "Enterprise",
  "same workspace",
  "active",
  "data residency",
  "billing ownership",
]) {
  if (!decision.toLowerCase().includes(required.toLowerCase())) failures.push(`decision record is missing ${required}`);
}

const audit = evidence["evidence/domain-audit.md"];
for (const required of [
  "current rules retained",
  "legacy or unsupported assumptions excluded",
  "context boundary",
  "current-access-policy.md",
  "legacy-rollout-notes.md",
  "support-example.md",
  "previous-agent-progress.md",
]) {
  if (!audit.toLowerCase().includes(required.toLowerCase())) failures.push(`domain-audit.md is missing ${required}`);
}
if (!/(?:previous implementation|before\.patch).{0,30}(?:was not|wasn't|not).{0,20}(?:provided|given|shared)/i.test(audit)) {
  failures.push("domain-audit.md must confirm that the final agent did not receive the previous implementation");
}

const comparison = evidence["evidence/comparison.md"];
for (const topic of ["fair", "vocabulary", "source", "authorization", "verification", "context"]) {
  if (!comparison.toLowerCase().includes(topic)) failures.push(`comparison.md must discuss ${topic}`);
}
for (const command of ["npm run test:rules", "npm run test:domain", "npm run agent:check"]) {
  if (!after.includes(command)) failures.push(`after.md must record ${command}`);
}

if (failures.length) {
  console.error("Domain-model verification failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`Domain-model verification passed: ${contextWords} words, fair first attempts, complete audit, patches, and command evidence.`);

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const failures = [];
const incidentPrompt = "Complete the automatic escalation fix for at-risk cases. Use the current SLA rules, preserve existing ownership and manual escalation behaviour, and keep the queue totals and saved workflow state consistent.";

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
  const manifestPath = path.join(appRoot, "scripts", "challenge-integrity.json");
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
  "evidence/before.md",
  "evidence/before.patch",
  "evidence/handoff.md",
  "evidence/handoff-audit.md",
  "evidence/after.md",
  "evidence/after.patch",
  "evidence/comparison.md",
];
const evidence = Object.fromEntries(evidencePaths.map((relativePath) => [relativePath, readRequired(relativePath)]));

if (failures.some((failure) => failure.startsWith("missing required evidence"))) {
  console.error("Handoff verification failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

for (const relativePath of [
  "evidence/before.md",
  "evidence/handoff.md",
  "evidence/handoff-audit.md",
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
if (field(before, "Prompt") !== incidentPrompt || field(after, "Prompt") !== incidentPrompt) {
  failures.push("before.md and after.md must record the exact incident request");
}
if (field(before, "Attempt") !== "1" || field(after, "Attempt") !== "1") {
  failures.push("both implementation sessions must be recorded as first attempts");
}
if (!/raw.session.history/i.test(field(before, "Context source"))) {
  failures.push("before.md must identify the raw session history as its context source");
}
if (!/handoff\.md/i.test(field(after, "Context source"))) {
  failures.push("after.md must identify evidence/handoff.md as its context source");
}
if (!/disabled/i.test(field(before, "Handoff skill")) || !/enabled/i.test(field(after, "Handoff skill"))) {
  failures.push("before.md and after.md must record the Handoff skill boundary");
}

for (const [name, patch] of [
  ["before.patch", evidence["evidence/before.patch"]],
  ["after.patch", evidence["evidence/after.patch"]],
]) {
  if (!patch.includes("diff --git") || !patch.includes("@@") || patch.length < 350) {
    failures.push(`evidence/${name} must contain a genuine implementation patch`);
  }
  for (const changedPath of ["escalationPolicy.ts", "workflowApi.ts"]) {
    if (!patch.includes(changedPath)) failures.push(`evidence/${name} must include the ${changedPath} change`);
  }
}
if (evidence["evidence/before.patch"] === evidence["evidence/after.patch"]) {
  failures.push("before.patch and after.patch must show different implementations");
}

const handoff = evidence["evidence/handoff.md"];
const handoffWords = handoff.trim().split(/\s+/).filter(Boolean).length;
if (handoffWords > 1200) failures.push(`handoff.md exceeds the 1,200-word context limit (${handoffWords} words)`);
if (handoffWords < 120) failures.push("handoff.md is too small to carry the verified incident state");
for (const required of [
  "docs/current-sla-policy.md",
  "docs/workflow-api-contract.md",
  "48",
  "owner",
  "manual",
  "remaining",
  "npm run test:incident",
]) {
  if (!handoff.toLowerCase().includes(required.toLowerCase())) failures.push(`handoff.md is missing ${required}`);
}
if (/24.hour[^\n.]*(?:current|use|required)|reassign[^\n.]*(?:incident desk|required)/i.test(handoff)) {
  failures.push("handoff.md carries a superseded threshold or ownership instruction as current guidance");
}

const audit = evidence["evidence/handoff-audit.md"];
for (const required of [
  "verified facts retained",
  "outdated or unsupported claims excluded",
  "handoff boundary",
  "current-sla-policy.md",
  "sla-rollout-proposal.md",
  "previous-agent-progress.md",
]) {
  if (!audit.toLowerCase().includes(required.toLowerCase())) failures.push(`handoff-audit.md is missing ${required}`);
}
if (!/raw session history (?:was not|wasn't|not) (?:provided|given|shared)/i.test(audit)) {
  failures.push("handoff-audit.md must confirm that the final agent did not receive the raw session history");
}

const comparison = evidence["evidence/comparison.md"];
for (const topic of ["fair", "requirement", "owner", "manual", "verification", "context"]) {
  if (!comparison.toLowerCase().includes(topic)) failures.push(`comparison.md must discuss ${topic}`);
}
for (const command of ["npm run test:incident", "npm run test:handoff", "npm run agent:check"]) {
  if (!after.includes(command)) failures.push(`after.md must record ${command}`);
}

if (failures.length) {
  console.error("Handoff verification failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`Handoff verification passed: ${handoffWords} words, fair first attempts, complete audit, patches, and command evidence.`);

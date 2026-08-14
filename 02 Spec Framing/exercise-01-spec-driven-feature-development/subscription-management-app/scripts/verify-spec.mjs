import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

function relative(...parts) {
  return path.join(...parts).replaceAll("\\", "/");
}

function readRequired(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing required submission file: ${relativePath}`);
    return null;
  }

  const content = fs.readFileSync(absolutePath, "utf8");
  if (!content.trim()) failures.push(`submission file is empty: ${relativePath}`);
  return content;
}

function sha256(absolutePath) {
  const normalizedContent = fs.readFileSync(absolutePath, "utf8").replaceAll("\r\n", "\n");
  return crypto.createHash("sha256").update(normalizedContent).digest("hex");
}

function verifyStarterIntegrity() {
  const manifestPath = path.join(root, "scripts/challenge-integrity.json");
  if (!fs.existsSync(manifestPath)) {
    failures.push("missing challenge integrity manifest");
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  for (const [relativePath, expectedHash] of Object.entries(manifest.protectedFiles ?? {})) {
    const absolutePath = path.join(root, relativePath);
    if (!fs.existsSync(absolutePath)) {
      failures.push(`protected starter file missing: ${relativePath}`);
    } else if (sha256(absolutePath) !== expectedHash) {
      failures.push(`protected starter file was changed: ${relativePath}`);
    }
  }
}

function captureField(content, field) {
  const match = content.match(new RegExp(`^- ${field}:\\s*(.+)$`, "mi"));
  return match?.[1].trim() ?? "";
}

function collectHeadingIds(content, prefix) {
  return [...new Set([...content.matchAll(new RegExp(`^#{2,6}\\s+(${prefix}-\\d{3})\\b`, "gm"))].map((match) => match[1]))];
}

function checkNoPlaceholders(relativePath, content) {
  const placeholderPatterns = [
    /\b(?:TODO|TBD|FIXME)\b/i,
    /\[(?:insert|replace|describe|explain|add|your)[^\]]*\]/i,
    /<[^>]*(?:here|placeholder)[^>]*>/i
  ];
  for (const pattern of placeholderPatterns) {
    if (pattern.test(content)) failures.push(`${relativePath} contains an instructional placeholder`);
  }
}

verifyStarterIntegrity();

const submissionPaths = [
  relative("specs", "clarifications.md"),
  relative("specs", "spec.md"),
  relative("specs", "plan.md"),
  relative("specs", "tasks.md"),
  relative("evidence", "before.md"),
  relative("evidence", "before.patch"),
  relative("evidence", "after.md"),
  relative("evidence", "after.patch"),
  relative("evidence", "comparison.md")
];
const submission = Object.fromEntries(submissionPaths.map((relativePath) => [relativePath, readRequired(relativePath)]));

if (submissionPaths.some((relativePath) => submission[relativePath] === null)) {
  console.error("Specification verification failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

for (const relativePath of [
  "specs/clarifications.md",
  "specs/spec.md",
  "specs/plan.md",
  "specs/tasks.md",
  "evidence/after.md",
  "evidence/comparison.md"
]) {
  checkNoPlaceholders(relativePath, submission[relativePath]);
}

const clarifications = submission["specs/clarifications.md"];
const questionMatches = [...clarifications.matchAll(/^## (Q\d+):\s*(.+)$/gm)];
if (questionMatches.length < 3 || questionMatches.length > 5) {
  failures.push("specs/clarifications.md must contain three to five Q-numbered questions");
}

const questionIds = questionMatches.map((match) => match[1]);
if (new Set(questionIds).size !== questionIds.length) failures.push("clarification question identifiers must be unique");

const clarificationCategories = new Set();
let assumptionCount = 0;
for (let index = 0; index < questionMatches.length; index += 1) {
  const match = questionMatches[index];
  const heading = match[2].trim();
  const start = match.index;
  const end = questionMatches[index + 1]?.index ?? clarifications.length;
  const section = clarifications.slice(start, end);

  if (!heading.endsWith("?")) failures.push(`${match[1]} must be written as a clear question`);

  const values = {};
  const minimumLengths = {
    Category: 4,
    "Repository evidence": 20,
    Status: 8,
    Decision: 20,
    Consequence: 20
  };
  for (const field of ["Category", "Repository evidence", "Status", "Decision", "Consequence"]) {
    values[field] = captureField(section, field);
    if (values[field].length < minimumLengths[field]) failures.push(`${match[1]} needs a meaningful ${field.toLowerCase()} value`);
  }

  for (const category of ["authorization", "billing", "failure", "scope"]) {
    if (values.Category.toLowerCase().includes(category)) clarificationCategories.add(category);
  }

  if (!/^(confirmed|assumption)$/i.test(values.Status)) {
    failures.push(`${match[1]} status must be Confirmed or Assumption`);
  }
  if (/^assumption$/i.test(values.Status)) assumptionCount += 1;

  const evidencePaths = values["Repository evidence"].match(/(?:docs|src)\/[A-Za-z0-9_./-]+/g) ?? [];
  if (!evidencePaths.length) failures.push(`${match[1]} must cite at least one docs/ or src/ repository path`);
  for (const evidencePath of evidencePaths) {
    if (!fs.existsSync(path.join(root, evidencePath.replace(/[).,;:]+$/, "")))) {
      failures.push(`${match[1]} cites a repository path that does not exist: ${evidencePath}`);
    }
  }
}

for (const category of ["authorization", "billing", "failure", "scope"]) {
  if (!clarificationCategories.has(category)) failures.push(`clarifications must include the ${category} category`);
}
if (assumptionCount < 1) failures.push("at least one unresolved product decision must be recorded explicitly as an assumption");
for (const requiredEvidence of ["docs/stakeholder-notes.md", "docs/billing-constraints.md", "src/"]) {
  if (!clarifications.includes(requiredEvidence)) failures.push(`clarifications must use repository evidence from ${requiredEvidence}`);
}
if (!/conflict|disagree|unresolved|unclear/i.test(clarifications)) {
  failures.push("clarifications must identify at least one conflicting or unresolved source statement");
}

const spec = submission["specs/spec.md"];
const plan = submission["specs/plan.md"];
const tasks = submission["specs/tasks.md"];
const requirementIds = collectHeadingIds(spec, "REQ");
const acceptanceIds = collectHeadingIds(spec, "AC");
const planIds = collectHeadingIds(plan, "PLAN");
const taskIds = collectHeadingIds(tasks, "TASK");

if (requirementIds.length < 4) failures.push("specs/spec.md must define at least four REQ identifiers");
if (acceptanceIds.length < 5) failures.push("specs/spec.md must define at least five AC identifiers");
if (planIds.length < 3) failures.push("specs/plan.md must contain at least three PLAN identifiers");
if (taskIds.length < 4) failures.push("specs/tasks.md must contain at least four TASK identifiers");

for (const topic of ["authoriz|permission", "billing|prorat", "pending", "fail|recover", "out.of.scope|not.in.scope"] ) {
  if (!new RegExp(topic, "i").test(spec)) failures.push(`specs/spec.md is missing required behavior matching: ${topic}`);
}

const givenCount = (spec.match(/\bGiven\b/g) ?? []).length;
const whenCount = (spec.match(/\bWhen\b/g) ?? []).length;
const thenCount = (spec.match(/\bThen\b/g) ?? []).length;
if (Math.min(givenCount, whenCount, thenCount) < acceptanceIds.length) {
  failures.push("every acceptance criterion must include observable Given, When, and Then behavior");
}

for (const requirementId of requirementIds) {
  if (!plan.includes(requirementId)) failures.push(`${requirementId} is not traced into specs/plan.md`);
  if (!tasks.includes(requirementId)) failures.push(`${requirementId} is not traced into specs/tasks.md`);
}
for (const acceptanceId of acceptanceIds) {
  if (!tasks.includes(acceptanceId)) failures.push(`${acceptanceId} is not traced into specs/tasks.md`);
}

const taskMatches = [...tasks.matchAll(/^#{2,6}\s+(TASK-\d{3})\b/gm)];
for (let index = 0; index < taskMatches.length; index += 1) {
  const start = taskMatches[index].index;
  const end = taskMatches[index + 1]?.index ?? tasks.length;
  const block = tasks.slice(start, end);
  if (!/\bREQ-\d{3}\b/.test(block)) failures.push(`${taskMatches[index][1]} must reference at least one requirement`);
  if (!/\bAC-\d{3}\b/.test(block)) failures.push(`${taskMatches[index][1]} must reference at least one acceptance criterion`);
}

const before = submission["evidence/before.md"];
const after = submission["evidence/after.md"];
const conditionFields = ["Agent", "Model", "Tools", "Permissions", "Time limit", "Prompt"];
for (const field of conditionFields) {
  const beforeValue = captureField(before, field);
  const afterValue = captureField(after, field);
  if (!beforeValue || !afterValue) failures.push(`before.md and after.md must both record ${field}`);
  if (beforeValue && afterValue && beforeValue.toLowerCase() !== afterValue.toLowerCase()) {
    failures.push(`before and after session conditions differ for ${field}`);
  }
}
if (captureField(before, "Attempt") !== "1" || captureField(after, "Attempt") !== "1") {
  failures.push("before and after evidence must record the first agent attempt without reruns");
}
if (!/invented|unsupported|assum/i.test(before) || !/missing|unanswered|unclear/i.test(before)) {
  failures.push("evidence/before.md must identify invented decisions and important missing questions");
}
if (!/\bQ\d+\b/.test(after) || !/\bREQ-\d{3}\b/.test(after)) {
  failures.push("evidence/after.md must connect clarified questions to final requirements");
}

const comparison = submission["evidence/comparison.md"];
if (!/same|identical|fair/i.test(comparison) || !/condition|agent|model/i.test(comparison)) {
  failures.push("evidence/comparison.md must explain why the comparison was fair");
}
if (new Set(comparison.match(/\bQ\d+\b/g) ?? []).size < 3) {
  failures.push("evidence/comparison.md must connect at least three improvements to clarification questions");
}
if (new Set(comparison.match(/\bREQ-\d{3}\b/g) ?? []).size < 3) {
  failures.push("evidence/comparison.md must connect at least three improvements to final requirements");
}

const beforePatch = submission["evidence/before.patch"];
const afterPatch = submission["evidence/after.patch"];
for (const [name, patch] of [["before.patch", beforePatch], ["after.patch", afterPatch]]) {
  if (!patch.includes("diff --git") || patch.length < 200) failures.push(`evidence/${name} must contain a genuine non-empty Git patch`);
  for (const artifact of ["specs/spec.md", "specs/plan.md", "specs/tasks.md"]) {
    if (!patch.includes(artifact)) failures.push(`evidence/${name} must include ${artifact}`);
  }
}
if (!afterPatch.includes("specs/clarifications.md")) failures.push("evidence/after.patch must include specs/clarifications.md");
if (beforePatch === afterPatch) failures.push("before.patch and after.patch must show different specification attempts");

if (failures.length) {
  console.error("Specification verification failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log("Specification verification passed: clarifications, traceability, fair comparison, evidence, and starter integrity are complete.");

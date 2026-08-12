import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

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
  const manifestPath = path.join(root, "scripts", "challenge-integrity.json");
  if (!fs.existsSync(manifestPath)) {
    failures.push("missing challenge integrity manifest");
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  for (const [relativePath, expectedHash] of Object.entries(manifest.protectedFiles ?? {})) {
    const absolutePath = path.resolve(root, relativePath);
    if (!fs.existsSync(absolutePath)) {
      failures.push(`protected challenge file missing: ${relativePath}`);
    } else if (sha256(absolutePath) !== expectedHash) {
      failures.push(`protected challenge file was changed: ${relativePath}`);
    }
  }
}

function captureField(content, field) {
  return content.match(new RegExp(`^- ${field}:\\s*(.+)$`, "mi"))?.[1].trim() ?? "";
}

function checkNoPlaceholders(relativePath, content) {
  const patterns = [
    /\b(?:TODO|TBD|FIXME)\b/i,
    /\[(?:insert|replace|describe|explain|add|your)[^\]]*\]/i,
    /<[^>]*(?:here|placeholder)[^>]*>/i
  ];
  for (const pattern of patterns) {
    if (pattern.test(content)) failures.push(`${relativePath} contains an instructional placeholder`);
  }
}

function resolveArtifact(label, value) {
  const cleaned = value.replace(/^`|`$/g, "").replaceAll("\\", "/");
  if (!cleaned || path.isAbsolute(cleaned) || cleaned.split("/").includes("..")) {
    failures.push(`${label} must be a project-relative Markdown path`);
    return null;
  }

  const absolutePath = path.resolve(root, cleaned);
  if (!absolutePath.startsWith(root + path.sep) || path.extname(absolutePath).toLowerCase() !== ".md") {
    failures.push(`${label} must point to a Markdown file inside the project`);
    return null;
  }
  if (!fs.existsSync(absolutePath)) {
    failures.push(`${label} does not exist: ${cleaned}`);
    return null;
  }

  return { relativePath: cleaned, content: fs.readFileSync(absolutePath, "utf8") };
}

verifyStarterIntegrity();

const evidencePaths = [
  "evidence/before.md",
  "evidence/before.patch",
  "evidence/after.md",
  "evidence/after.patch",
  "evidence/comparison.md",
  "evidence/skill-usage.md",
  "evidence/tdd.md",
  "evidence/review.md"
];
const evidence = Object.fromEntries(evidencePaths.map((relativePath) => [relativePath, readRequired(relativePath)]));

for (const relativePath of ["src/App.tsx", "src/services/invitationService.ts"]) {
  readRequired(relativePath);
}

if (failures.some((failure) => failure.startsWith("missing required submission file"))) {
  console.error("Submission verification failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

for (const relativePath of [
  "evidence/before.md",
  "evidence/after.md",
  "evidence/comparison.md",
  "evidence/skill-usage.md",
  "evidence/tdd.md",
  "evidence/review.md"
]) {
  checkNoPlaceholders(relativePath, evidence[relativePath]);
}

const before = evidence["evidence/before.md"];
const after = evidence["evidence/after.md"];
const expectedPrompt = "Add a Team Invitations section. An active owner or admin allowed by the workspace policy may invite an email as a member or guest. Guest invitations are allowed only when the workspace policy permits them. Prevent invitations for existing members or an email with a pending invitation. Invitations must use the configured expiry period and may be accepted or revoked only once. Rejected actions must not change invitation or member data.";
for (const field of ["Agent", "Model", "Tools", "Permissions", "Time limit", "Prompt"]) {
  const beforeValue = captureField(before, field);
  const afterValue = captureField(after, field);
  if (!beforeValue || !afterValue) failures.push(`before.md and after.md must both record ${field}`);
  if (beforeValue && afterValue && beforeValue.toLowerCase() !== afterValue.toLowerCase()) {
    failures.push(`before and after session conditions differ for ${field}`);
  }
}
if (captureField(before, "Prompt") !== expectedPrompt || captureField(after, "Prompt") !== expectedPrompt) {
  failures.push("before.md and after.md must record the exact supplied feature request");
}
if (captureField(before, "Attempt") !== "1" || captureField(after, "Attempt") !== "1") {
  failures.push("before and after evidence must record the first attempt without reruns");
}
if (!/without superpowers|superpowers (?:was )?disabled/i.test(before)) {
  failures.push("evidence/before.md must identify that Superpowers was not enabled");
}
if (!/superpowers:/i.test(after) || !/design|plan|test|review|verif/i.test(after)) {
  failures.push("evidence/after.md must connect Superpowers skills to the completed workflow");
}
for (const command of ["npm run test:invitations", "npm run submission:verify", "npm run agent:check"]) {
  if (!after.includes(command)) failures.push(`evidence/after.md must record ${command}`);
}

const beforePatch = evidence["evidence/before.patch"];
const afterPatch = evidence["evidence/after.patch"];
for (const [name, patch] of [["before.patch", beforePatch], ["after.patch", afterPatch]]) {
  if (!patch.includes("diff --git") || patch.length < 400) failures.push(`evidence/${name} must contain a genuine Git patch`);
  for (const changedPath of ["src/services/invitationService.ts", "src/App.tsx"]) {
    if (!patch.includes(changedPath)) failures.push(`evidence/${name} must include ${changedPath}`);
  }
}
if (beforePatch === afterPatch) failures.push("before.patch and after.patch must show different implementations");

const skillUsage = evidence["evidence/skill-usage.md"];
if (captureField(skillUsage, "Superpowers version or commit").length < 2) {
  failures.push("skill-usage.md must record the Superpowers version or commit");
}
if (captureField(skillUsage, "Design approval").length < 20) {
  failures.push("skill-usage.md must record the design approval completed before planning");
}

const requiredSkills = [
  "superpowers:brainstorming",
  "superpowers:writing-plans",
  "superpowers:test-driven-development",
  "superpowers:requesting-code-review",
  "superpowers:verification-before-completion"
];
for (const skill of requiredSkills) {
  if (!skillUsage.includes(skill)) failures.push(`skill-usage.md must record ${skill}`);
}
if (!/superpowers:(?:subagent-driven-development|executing-plans)/.test(skillUsage)) {
  failures.push("skill-usage.md must record the execution workflow selected by Superpowers");
}

const brainstormingIndex = skillUsage.indexOf("superpowers:brainstorming");
const planningIndex = skillUsage.indexOf("superpowers:writing-plans");
const executionIndex = skillUsage.search(/superpowers:(?:subagent-driven-development|executing-plans)/);
const tddIndex = skillUsage.indexOf("superpowers:test-driven-development");
const reviewIndex = skillUsage.indexOf("superpowers:requesting-code-review");
const verificationIndex = skillUsage.indexOf("superpowers:verification-before-completion");
if (
  brainstormingIndex < 0 ||
  planningIndex <= brainstormingIndex ||
  executionIndex <= planningIndex ||
  tddIndex <= planningIndex ||
  reviewIndex <= Math.max(executionIndex, tddIndex) ||
  verificationIndex <= reviewIndex
) {
  failures.push("skill-usage.md must record approved design, plan, execution and TDD, review, then verification");
}

const designArtifact = resolveArtifact("Design artifact", captureField(skillUsage, "Design artifact"));
const planArtifact = resolveArtifact("Plan artifact", captureField(skillUsage, "Plan artifact"));
if (designArtifact) {
  if (designArtifact.content.length < 500) failures.push(`${designArtifact.relativePath} is too small to contain an approved feature design`);
  for (const topic of ["authoriz|permission", "duplicate|normaliz", "guest|policy", "expir", "accept|revoke", "error|reject|failure"]) {
    if (!new RegExp(topic, "i").test(designArtifact.content)) failures.push(`${designArtifact.relativePath} is missing design coverage for ${topic}`);
  }
  checkNoPlaceholders(designArtifact.relativePath, designArtifact.content);
}
if (planArtifact) {
  if (planArtifact.content.length < 600) failures.push(`${planArtifact.relativePath} is too small to contain an executable implementation plan`);
  for (const requiredReference of ["src/services/invitationService.ts", "src/App.tsx", "tests/invitationService.test.ts", "npm run test:invitations"]) {
    if (!planArtifact.content.includes(requiredReference)) failures.push(`${planArtifact.relativePath} must reference ${requiredReference}`);
  }
  checkNoPlaceholders(planArtifact.relativePath, planArtifact.content);
}

const tdd = evidence["evidence/tdd.md"];
const redIndex = tdd.search(/^## Red\b/im);
const greenIndex = tdd.search(/^## Green\b/im);
if (redIndex < 0 || greenIndex <= redIndex) failures.push("tdd.md must record Red before Green");
if ((tdd.match(/npm run test:invitations/g) ?? []).length < 2) failures.push("tdd.md must contain the invitation command for both Red and Green");
if (!/exit (?:code)?:?\s*1|failed|failures?/i.test(tdd.slice(Math.max(0, redIndex), Math.max(0, greenIndex)))) {
  failures.push("the Red section must contain an actual failing result");
}
if (!/exit (?:code)?:?\s*0|16 pass|pass 16|tests? passed/i.test(tdd.slice(Math.max(0, greenIndex)))) {
  failures.push("the Green section must contain an actual passing result");
}

const comparison = evidence["evidence/comparison.md"];
if (!/same|identical|fair/i.test(comparison) || !/agent|model|condition/i.test(comparison)) {
  failures.push("comparison.md must explain why the two runs were fair");
}
let comparedRisks = 0;
for (const risk of ["authoriz|permission", "duplicate|email", "guest|policy", "expir", "single.use|accept|revoke", "mutat|state"]) {
  if (new RegExp(risk, "i").test(comparison)) comparedRisks += 1;
}
if (comparedRisks < 4) failures.push("comparison.md must compare at least four invitation lifecycle risks");
if (!/superpowers:/i.test(comparison)) failures.push("comparison.md must connect improvements to specific Superpowers skills");

const review = evidence["evidence/review.md"];
if (!/severity|no findings/i.test(review) || !/resolution|resolved|no findings/i.test(review) || !/verif|test/i.test(review)) {
  failures.push("review.md must contain review severity, resolution, and verification evidence");
}

const service = fs.readFileSync(path.join(root, "src", "services", "invitationService.ts"), "utf8");
if (service.includes("Invitation lifecycle is not implemented")) failures.push("invitationService.ts still contains the starter implementation");
if (/legacy\/quickInvite|quickInvite/.test(service)) failures.push("invitationService.ts must not reuse the unsafe legacy helper");
for (const exportName of ["createInvitation", "acceptInvitation", "revokeInvitation"]) {
  const exported = new RegExp(`export\\s+(?:function\\s+${exportName}\\b|const\\s+${exportName}\\s*=)`).test(service);
  if (!exported) failures.push(`invitationService.ts must export ${exportName}`);
}

function collectSource(directory) {
  const sources = [];
  if (!fs.existsSync(directory)) return sources;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) sources.push(...collectSource(absolutePath));
    if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) sources.push(fs.readFileSync(absolutePath, "utf8"));
  }
  return sources;
}

const applicationSource = collectSource(path.join(root, "src")).join("\n");
if (!/Team Invitations/i.test(applicationSource)) failures.push("the application must contain a visible Team Invitations section");
if (!/invitationService/.test(applicationSource.replace(service, ""))) {
  failures.push("the Team Invitations interface must use the shared invitation service");
}

if (failures.length) {
  console.error("Submission verification failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log("Submission verification passed: Superpowers workflow evidence, artifacts, implementation wiring, and challenge integrity are complete.");

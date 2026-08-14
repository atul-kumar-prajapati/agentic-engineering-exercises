import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const appRoot = path.resolve(import.meta.dirname, "..");
const exerciseRoot = path.resolve(appRoot, "..");
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

function read(relativePath) {
  const absolutePath = path.join(exerciseRoot, relativePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, "utf8") : "";
}

function collectMarkdown(directory) {
  const files = [];
  if (!existsSync(directory)) return files;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectMarkdown(absolutePath));
    if (entry.isFile() && /\.md$/i.test(entry.name)) files.push(absolutePath);
  }
  return files;
}

function requireTerms(source, relativePath, terms) {
  for (const term of terms) {
    check(source.includes(term), `${relativePath} is missing ${term}`);
  }
}

function fieldValue(source, label) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return source.match(new RegExp(`^- ${escapedLabel}:\\s*(.+)$`, "m"))?.[1]?.trim() ?? "";
}

function checkRunMetrics(source, relativePath) {
  const forbiddenPlaceholders = [
    "Pass or fail",
    "exit code: N",
    "+N / -N",
    "Failed checks or",
    "File and line"
  ];
  for (const placeholder of forbiddenPlaceholders) {
    check(!source.includes(placeholder), `${relativePath} still contains the placeholder ${placeholder}`);
  }
  check(
    /\| `npm run agent:check` \|[^\n]*exit code:\s*-?\d+/i.test(source),
    `${relativePath} must record the agent:check exit code`
  );
  check(
    /\| `npm run verify:implementation` \|[^\n]*exit code:\s*-?\d+/i.test(source),
    `${relativePath} must record the implementation-check exit code`
  );
  check(/\| Files changed \|\s*\d+\s*\|/.test(source), `${relativePath} must record a numeric file count`);
  check(
    /\| Lines added and removed \|\s*\+\d+\s*\/\s*-\d+\s*\|/.test(source),
    `${relativePath} must record numeric added and removed lines`
  );
}

const agentsSource = read("agent-onboarding-app/AGENTS.md");
check(agentsSource.length >= 150, "agent-onboarding-app/AGENTS.md is missing or does not contain meaningful guidance");
check(agentsSource.split(/\r?\n/).length <= 120, "AGENTS.md must remain concise at 120 lines or fewer");

const supportingGuides = collectMarkdown(path.join(appRoot, ".agent"));
const guidanceSources = [agentsSource];
for (const absolutePath of supportingGuides) {
  const contents = readFileSync(absolutePath, "utf8");
  const linkedGuide = `.agent/${path.relative(path.join(appRoot, ".agent"), absolutePath).replaceAll("\\", "/")}`;
  check(contents.length >= 150, `${linkedGuide} does not contain meaningful guidance`);
  check(agentsSource.includes(linkedGuide), `AGENTS.md must direct agents to ${linkedGuide}`);
  guidanceSources.push(contents);
}

const combinedGuidance = guidanceSources.join("\n");
check(!/needs[ -]attention/i.test(combinedGuidance), "onboarding must not contain the sample feature solution");
check(/\bsrc[\\/]/i.test(combinedGuidance), "onboarding must explain the source-code structure");
check(/routing|caseRouter|queue/i.test(combinedGuidance), "onboarding must explain the routing area");
check(combinedGuidance.includes("npm run agent:check"), "onboarding must identify the normal repository check");

const before = read("evidence/before.md");
const after = read("evidence/after.md");
const comparison = read("evidence/comparison.md");

check(before.length >= 300, "evidence/before.md is missing or incomplete");
requireTerms(before, "evidence/before.md", [
  "### Run",
  "Starting commit:",
  "Implementation commit:",
  "Agent and model:",
  "Tools and permissions:",
  "Time limit:",
  "Human hints: 0",
  "Retries: 0",
  "Onboarding available: No",
  "npm run agent:check",
  "npm run verify:implementation",
  "Files changed",
  "Lines added and removed",
  "Unmet requirements",
  "### Problems Found"
]);
checkRunMetrics(before, "evidence/before.md");

check(after.length >= 300, "evidence/after.md is missing or incomplete");
requireTerms(after, "evidence/after.md", [
  "### Run",
  "Starting commit:",
  "Implementation commit:",
  "Agent and model:",
  "Tools and permissions:",
  "Time limit:",
  "Human hints: 0",
  "Retries: 0",
  "Onboarding files read:",
  "npm run agent:check",
  "npm run verify:implementation",
  "Files changed",
  "Lines added and removed",
  "Unmet requirements",
  "### Onboarding Used"
]);
checkRunMetrics(after, "evidence/after.md");

const shaPattern = /^[0-9a-f]{40}$/i;
for (const [source, relativePath] of [
  [before, "evidence/before.md"],
  [after, "evidence/after.md"]
]) {
  for (const label of ["Starting commit", "Implementation commit"]) {
    check(shaPattern.test(fieldValue(source, label)), `${relativePath} must record a full ${label.toLowerCase()} SHA`);
  }
  for (const label of ["Agent and model", "Tools and permissions", "Time limit"]) {
    check(fieldValue(source, label).length > 0, `${relativePath} must record ${label.toLowerCase()}`);
  }
}
check(
  fieldValue(before, "Starting commit") === fieldValue(after, "Starting commit"),
  "before and after runs must record the same starting commit"
);
for (const label of ["Agent and model", "Tools and permissions", "Time limit"]) {
  check(fieldValue(before, label) === fieldValue(after, label), `before and after runs must use the same ${label.toLowerCase()}`);
}
check(
  fieldValue(after, "Onboarding files read").length > 0,
  "evidence/after.md must name the onboarding files that were read"
);

check(comparison.length >= 300, "evidence/comparison.md is missing or incomplete");
requireTerms(comparison, "evidence/comparison.md", [
  "### Fair Comparison",
  "Condition",
  "Before",
  "After",
  "Starting commit",
  "Production change",
  "Agent and model",
  "Tools and permissions",
  "Time limit",
  "Human hints",
  "Retries",
  "### Results",
  "Application check",
  "Implementation check",
  "Failed requirements",
  "Files changed",
  "Lines added and removed",
  "### Conclusion"
]);
for (const placeholder of ["Yes or No", "| |", "### Conclusion\n\nState whether"]) {
  check(!comparison.includes(placeholder), `evidence/comparison.md still contains the placeholder ${placeholder}`);
}
const sameResults = comparison.match(/\|\s*Yes\s*\|/gi) ?? [];
check(sameResults.length >= 7, "evidence/comparison.md must confirm all seven run conditions are the same");

for (const relativePath of ["evidence/before.patch", "evidence/after.patch"]) {
  const contents = read(relativePath);
  check(
    contents.includes("diff --git") && contents.includes("@@"),
    `${relativePath} must contain a non-empty Git patch`
  );
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log("Agent onboarding and evidence verified.");

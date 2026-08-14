import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { evaluateReleaseNotes } from "./verify-release-notes.mjs";

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const failures = [];
const required = [
  "evidence/before.md",
  "evidence/before-output.md",
  "evidence/after.md",
  "evidence/after-output.md",
  "evidence/hotfix-output.md",
  "evidence/internal-output.md",
  "evidence/skill-record.md",
  "evidence/resource-usage.json",
  "evidence/eval-results.json",
  "evidence/comparison.md",
];
const values = {};

for (const relative of required) {
  const absolute = path.join(exerciseRoot, relative);
  if (!fs.existsSync(absolute)) {
    failures.push(`missing ${relative}`);
    values[relative] = "";
  } else {
    values[relative] = fs.readFileSync(absolute, "utf8");
    if (values[relative].trim().length < 80) failures.push(`${relative} is too short to contain the required evidence`);
  }
}

function field(text, name) {
  return text.match(new RegExp(`^- ${name}:\\s*(.+)$`, "im"))?.[1].trim() ?? "";
}

const before = values["evidence/before.md"];
const after = values["evidence/after.md"];
for (const label of ["Agent", "Model", "Other tools", "Permissions", "Time limit", "Prompt", "Repository commit", "Attempt", "Release-notes skill", "Input context", "Context bytes", "Output"]) {
  if (!field(before, label)) failures.push(`before.md is missing ${label}`);
  if (!field(after, label)) failures.push(`after.md is missing ${label}`);
}
for (const label of ["Agent", "Model", "Other tools", "Permissions", "Time limit", "Prompt", "Repository commit", "Attempt"]) {
  if (field(before, label) && field(before, label) !== field(after, label)) failures.push(`${label} must match in before.md and after.md`);
}
if (field(before, "Attempt") !== "1" || field(after, "Attempt") !== "1") failures.push("both primary runs must be first attempts");
if (!/^disabled$/i.test(field(before, "Release-notes skill"))) failures.push("before.md must record the release-notes skill as disabled");
if (!/^enabled$/i.test(field(after, "Release-notes skill"))) failures.push("after.md must record the release-notes skill as enabled");
if (!/monolithic-skill-draft\.md/i.test(field(before, "Input context"))) failures.push("before.md must identify the monolithic draft input");
if (!/\.agents[\\/]skills[\\/]release-notes[\\/]skill\.md/i.test(field(after, "Input context"))) failures.push("after.md must identify the packaged SKILL.md input");
if (!/^[a-f0-9]{40}$/i.test(field(before, "Repository commit"))) failures.push("both runs need one matching 40-character repository commit");
const monolithicBytes = Buffer.byteLength(fs.readFileSync(path.join(exerciseRoot, "docs", "monolithic-skill-draft.md"), "utf8"), "utf8");
if (Number(field(before, "Context bytes")) !== monolithicBytes) failures.push(`before.md Context bytes must equal the monolithic draft size (${monolithicBytes})`);
for (const text of [before, after]) {
  for (const term of ["files read", "commands executed", "verification", "exit code"]) {
    if (!text.toLowerCase().includes(term)) failures.push(`before.md and after.md must both record ${term}`);
  }
}

const skillRecord = values["evidence/skill-record.md"];
for (const term of [
  "https://github.com/anthropics/skills/tree/main/skills/skill-creator",
  "source commit:",
  "installed path:",
  "skill.md sha-256:",
]) {
  if (!skillRecord.toLowerCase().includes(term.toLowerCase())) failures.push(`skill-record.md is missing ${term}`);
}
if (!/source commit:\s*[a-f0-9]{40}\b/i.test(skillRecord)) failures.push("skill-record.md needs a 40-character source commit");
if (!/skill\.md sha-256:\s*[a-f0-9]{64}\b/i.test(skillRecord)) failures.push("skill-record.md needs a 64-character SKILL.md hash");
if (!/installed path:.*skill-creator[\\/]skill\.md/i.test(skillRecord)) failures.push("skill-record.md needs the installed skill-creator/SKILL.md path");

let resourceUsage;
try {
  const usage = JSON.parse(values["evidence/resource-usage.json"] || "null");
  resourceUsage = usage;
  const scenarios = usage?.scenarios;
  if (!Array.isArray(scenarios) || scenarios.length !== 3) {
    failures.push("resource-usage.json needs exactly three scenarios");
  } else {
    const expected = {
      "full-release": ["references/publication-policy.md", "references/evidence-policy.md", "references/migration-policy.md"],
      "hotfix-only": ["references/publication-policy.md", "references/evidence-policy.md"],
      "internal-only": ["references/publication-policy.md"],
    };
    for (const [id, resources] of Object.entries(expected)) {
      const scenario = scenarios.find((item) => item.id === id);
      if (!scenario) {
        failures.push(`resource-usage.json is missing ${id}`);
        continue;
      }
      const actualResources = Array.isArray(scenario.resources_read) ? [...new Set(scenario.resources_read)].sort() : [];
      if (JSON.stringify(actualResources) !== JSON.stringify([...resources].sort())) failures.push(`${id} must record only its expected references`);
      const expectedContextFiles = ["SKILL.md", ...resources];
      if (JSON.stringify(scenario.context_files) !== JSON.stringify(expectedContextFiles)) failures.push(`${id} context_files must contain SKILL.md and only the references actually read`);
      const expectedBytes = Object.fromEntries(expectedContextFiles.map((file) => [file, Buffer.byteLength(fs.readFileSync(path.join(appRoot, ".agents", "skills", "release-notes", ...file.split("/")), "utf8"), "utf8")]));
      if (JSON.stringify(scenario.context_bytes) !== JSON.stringify(expectedBytes)) failures.push(`${id} context_bytes do not match the current skill files`);
      const expectedTotal = Object.values(expectedBytes).reduce((sum, bytes) => sum + bytes, 0);
      if (scenario.total_context_bytes !== expectedTotal) failures.push(`${id} total_context_bytes must equal ${expectedTotal}`);
      if (JSON.stringify(scenario.scripts_run) !== JSON.stringify(["scripts/extract-release.mjs"])) failures.push(`${id} must run the shared extractor once`);
      if (typeof scenario.prompt !== "string" || scenario.prompt.length < 60) failures.push(`${id} needs the exact substantive prompt`);
      if (typeof scenario.reason !== "string" || scenario.reason.length < 40) failures.push(`${id} needs a resource-selection reason`);
      if (typeof scenario.output !== "string" || !scenario.output) failures.push(`${id} needs an output path`);
    }
  }
} catch {
  failures.push("resource-usage.json is invalid JSON");
}
const fullReleaseUsage = resourceUsage?.scenarios?.find((item) => item.id === "full-release");
if (fullReleaseUsage && Number(field(after, "Context bytes")) !== fullReleaseUsage.total_context_bytes) failures.push("after.md Context bytes must match the full-release measured total");
if (fullReleaseUsage && fullReleaseUsage.total_context_bytes >= monolithicBytes) failures.push("the packaged skill must reduce full-release context bytes compared with the monolithic draft");

try {
  const results = JSON.parse(values["evidence/eval-results.json"] || "null");
  const qualityDefinitions = JSON.parse(fs.readFileSync(path.join(appRoot, ".agents", "skills", "release-notes", "evals", "evals.json"), "utf8"));
  const triggerDefinitions = JSON.parse(fs.readFileSync(path.join(appRoot, ".agents", "skills", "release-notes", "evals", "trigger-evals.json"), "utf8"));
  if (!Array.isArray(results?.quality) || results.quality.length !== 4) {
    failures.push("eval-results.json quality must contain baseline full-release plus three with-skill results");
  } else {
    const requiredRuns = [
      ["full-release", "without_skill"],
      ["full-release", "with_skill"],
      ["hotfix-only", "with_skill"],
      ["internal-only", "with_skill"],
    ];
    for (const [id, configuration] of requiredRuns) {
      const run = results.quality.find((item) => item.id === id && item.configuration === configuration);
      if (!run) {
        failures.push(`eval-results.json is missing ${id} ${configuration}`);
        continue;
      }
      if (!Number.isInteger(run.passed) || !Number.isInteger(run.total) || run.total < 3 || run.passed < 0 || run.passed > run.total) failures.push(`${id} ${configuration} has invalid expectation counts`);
      if (typeof run.output !== "string" || !run.output) failures.push(`${id} ${configuration} needs an output path`);
      if (!Array.isArray(run.evidence) || run.evidence.length < run.total) failures.push(`${id} ${configuration} needs evidence for every expectation`);
      if (run.evidence?.some((entry) => typeof entry !== "string" || entry.length < 12)) failures.push(`${id} ${configuration} has weak expectation evidence`);
      if (configuration === "with_skill" && run.passed !== run.total) failures.push(`${id} with_skill must pass every expectation`);
      const definition = qualityDefinitions.evals.find((item) => item.prompt.toLowerCase().includes(id));
      if (!definition || run.total !== definition.expectations.length) failures.push(`${id} ${configuration} totals must match evals/evals.json`);
    }
  }
  if (!Array.isArray(results?.trigger) || results.trigger.length !== 10) {
    failures.push("eval-results.json trigger must contain all ten trigger results");
  } else {
    results.trigger.forEach((item, index) => {
      const definition = triggerDefinitions[index];
      if (typeof item.expected !== "boolean" || typeof item.actual !== "boolean" || item.expected !== item.actual) failures.push(`trigger result ${index + 1} must match its expected decision`);
      if (typeof item.query !== "string" || item.query.length < 50 || typeof item.evidence !== "string" || item.evidence.length < 20) failures.push(`trigger result ${index + 1} needs its query and evidence`);
      if (!definition || item.query !== definition.query || item.expected !== definition.should_trigger) failures.push(`trigger result ${index + 1} must match evals/trigger-evals.json`);
    });
  }
} catch {
  failures.push("eval-results.json is invalid JSON");
}

const comparison = values["evidence/comparison.md"].toLowerCase();
for (const term of [
  "same prompt",
  "same agent",
  "same model",
  "same tools",
  "same permissions",
  "same time limit",
  "skill was the only changed input",
  "trigger",
  "git range",
  "customer",
  "breaking",
  "missing evidence",
  "internal",
  "resources",
  "script",
  "verification",
  "context",
  "bytes",
]) {
  if (!comparison.includes(term)) failures.push(`comparison.md is missing ${term}`);
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "release-submission-check-"));
try {
  if (values["evidence/before-output.md"] && values["evidence/after-output.md"]) {
    const repository = path.join(tempRoot, "fixture");
    execFileSync("git", ["clone", "--quiet", path.join(exerciseRoot, "fixtures", "release-history.bundle"), repository]);
    const beforeScore = evaluateReleaseNotes(repository, path.join(exerciseRoot, "evidence", "before-output.md"));
    const afterScore = evaluateReleaseNotes(repository, path.join(exerciseRoot, "evidence", "after-output.md"));
    if (afterScore.passed !== afterScore.total) failures.push(`after-output.md scores ${afterScore.score}; every release requirement must pass`);
    if (afterScore.score < beforeScore.score) failures.push("after-output.md must not score below before-output.md");
  }

  const hotfix = values["evidence/hotfix-output.md"];
  const hotfixSection = hotfix.match(/## Customer-facing changes\s+([\s\S]*?)(?=\n## |$)/i)?.[1] ?? "";
  const hotfixItems = hotfixSection.split(/\n(?=### )/).filter((item) => /^### /i.test(item.trim()));
  if (hotfixItems.length !== 1 || !/checkout|retry|declin/i.test(hotfixItems[0])) failures.push("hotfix-output.md must publish exactly the checkout hotfix");
  for (const term of ["trace:", "src/checkout.js", "CI-881-unit", "CI-881-e2e", "screenshot", "missing"]) {
    if (!hotfix.toLowerCase().includes(term.toLowerCase())) failures.push(`hotfix-output.md is missing ${term}`);
  }
  if (/billing|telemetry|migration-policy/i.test(hotfixSection)) failures.push("hotfix-output.md includes unrelated release content");

  const internal = values["evidence/internal-output.md"];
  if (/## Customer-facing changes/i.test(internal)) failures.push("internal-output.md must not invent a customer-facing section");
  for (const term of ["breaking-head..origin/exercise-head", "no customer-facing", "src/telemetry.js", "git"]) {
    if (!internal.toLowerCase().includes(term.toLowerCase())) failures.push(`internal-output.md is missing ${term}`);
  }
} finally {
  const resolved = path.resolve(tempRoot);
  const tempBase = path.resolve(os.tmpdir()) + path.sep;
  if (resolved.startsWith(tempBase)) fs.rmSync(resolved, { recursive: true, force: true });
}

if (failures.length) {
  console.error("Skill submission verification failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log("Comparable runs, skill provenance, selective resource use, eval results, and verified release notes are present.");

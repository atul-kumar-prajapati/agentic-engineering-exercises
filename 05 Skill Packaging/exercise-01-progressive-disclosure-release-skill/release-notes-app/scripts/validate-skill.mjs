import fs from "node:fs";
import path from "node:path";

const skillRoot = path.join(process.cwd(), ".agents", "skills", "release-notes");
const failures = [];
const required = [
  "SKILL.md",
  "references/publication-policy.md",
  "references/evidence-policy.md",
  "references/migration-policy.md",
  "scripts/extract-release.mjs",
  "evals/evals.json",
  "evals/trigger-evals.json",
];
const values = {};

for (const relative of required) {
  const absolute = path.join(skillRoot, relative);
  if (!fs.existsSync(absolute)) {
    failures.push(`missing ${path.relative(process.cwd(), absolute)}`);
    values[relative] = "";
  } else {
    values[relative] = fs.readFileSync(absolute, "utf8");
  }
}

const skill = values["SKILL.md"];
if (skill) {
  const frontmatter = skill.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1] ?? "";
  const name = frontmatter.match(/^name:\s*(.+)$/mi)?.[1].trim() ?? "";
  const description = frontmatter.match(/^description:\s*(.+)$/mi)?.[1].trim() ?? "";
  const compatibility = frontmatter.match(/^compatibility:\s*(.+)$/mi)?.[1].trim() ?? "";

  if (name !== "release-notes") failures.push("SKILL.md name must be release-notes");
  if (description.length < 80 || description.length > 1024) failures.push("description must be specific and between 80 and 1024 characters");
  if (!/use when|use for|when (?:the )?user/i.test(description)) failures.push("description must say when the skill should trigger");
  if (!/do not use|not for|exclude/i.test(description)) failures.push("description must define a negative trigger boundary");
  if (!/git/i.test(compatibility) || !/node/i.test(compatibility)) failures.push("compatibility must declare Git and Node.js requirements");

  const lines = skill.split(/\r?\n/).length;
  const words = skill.trim().split(/\s+/).length;
  if (lines > 120) failures.push(`SKILL.md has ${lines} lines; keep it at or below 120`);
  if (words > 1200) failures.push(`SKILL.md has ${words} words; keep it at or below 1200`);

  for (const resource of [
    "references/publication-policy.md",
    "references/evidence-policy.md",
    "references/migration-policy.md",
    "scripts/extract-release.mjs",
  ]) {
    if (!skill.includes(resource)) failures.push(`SKILL.md does not route to ${resource}`);
  }
  if (!/when[\s\S]{0,100}migration-policy\.md/i.test(skill)) failures.push("SKILL.md must load migration policy conditionally");
  if (!/when[\s\S]{0,100}evidence-policy\.md/i.test(skill)) failures.push("SKILL.md must load evidence policy conditionally");
  if (!/extract-release\.mjs[\s\S]{0,200}--repo[\s\S]{0,100}--base[\s\S]{0,100}--head/i.test(skill)) {
    failures.push("SKILL.md must document the extractor interface");
  }
}

const referenceChecks = {
  "references/publication-policy.md": [/customer/i, /trace/i, /internal/i],
  "references/evidence-policy.md": [/evidence/i, /missing/i, /pass/i],
  "references/migration-policy.md": [/breaking/i, /migration/i, /old|previous/i],
};
for (const [relative, patterns] of Object.entries(referenceChecks)) {
  const content = values[relative];
  if (!content) continue;
  const lineCount = content.split(/\r?\n/).length;
  if (lineCount < 8 || lineCount > 120) failures.push(`${relative} must be focused and between 8 and 120 lines`);
  for (const pattern of patterns) {
    if (!pattern.test(content)) failures.push(`${relative} is missing focused ${pattern.source} guidance`);
  }
}

if (skill) {
  const skillParagraphs = new Set(skill.split(/\r?\n\s*\r?\n/).map((part) => part.trim().toLowerCase()).filter((part) => part.split(/\s+/).length >= 12));
  for (const relative of Object.keys(referenceChecks)) {
    const duplicates = values[relative]
      .split(/\r?\n\s*\r?\n/)
      .map((part) => part.trim().toLowerCase())
      .filter((part) => skillParagraphs.has(part));
    if (duplicates.length) failures.push(`${relative} duplicates a long SKILL.md paragraph instead of using progressive disclosure`);
  }
}

const extractor = values["scripts/extract-release.mjs"];
if (extractor) {
  if (!/--repo/.test(extractor) || !/--base/.test(extractor) || !/--head/.test(extractor)) failures.push("extract-release.mjs must accept --repo, --base, and --head");
  if (!/(execFile|spawn).*git|git[\s\S]*(diff|log)/is.test(extractor)) failures.push("extract-release.mjs must derive output from Git");
  if (!/JSON\.stringify/.test(extractor)) failures.push("extract-release.mjs must emit JSON");
  for (const fixtureLiteral of ["d3b56d0", "1c43101", "checkout.js", "billing-export.js", "telemetry.js"]) {
    if (extractor.includes(fixtureLiteral)) failures.push(`extract-release.mjs contains fixture-specific answer ${fixtureLiteral}`);
  }
}

try {
  const evals = JSON.parse(values["evals/evals.json"] || "null");
  if (evals?.skill_name !== "release-notes") failures.push("evals/evals.json skill_name must be release-notes");
  if (!Array.isArray(evals?.evals) || evals.evals.length !== 3) {
    failures.push("evals/evals.json must contain exactly three quality evals");
  } else {
    const ids = new Set();
    for (const item of evals.evals) {
      if (!Number.isInteger(item.id) || ids.has(item.id)) failures.push("quality eval IDs must be unique integers");
      ids.add(item.id);
      if (typeof item.prompt !== "string" || item.prompt.length < 80) failures.push(`quality eval ${item.id} needs a substantive prompt`);
      if (typeof item.expected_output !== "string" || item.expected_output.length < 40) failures.push(`quality eval ${item.id} needs a clear expected_output`);
      if (!Array.isArray(item.files)) failures.push(`quality eval ${item.id} files must be an array`);
      if (!Array.isArray(item.expectations) || item.expectations.length < 3) failures.push(`quality eval ${item.id} needs at least three verifiable expectations`);
    }
    const all = JSON.stringify(evals.evals).toLowerCase();
    for (const scenario of ["full-release", "hotfix", "internal-only"]) {
      if (!all.includes(scenario)) failures.push(`quality evals must cover ${scenario}`);
    }
  }
} catch {
  failures.push("evals/evals.json is invalid JSON");
}

try {
  const triggerEvals = JSON.parse(values["evals/trigger-evals.json"] || "null");
  if (!Array.isArray(triggerEvals) || triggerEvals.length !== 10) {
    failures.push("evals/trigger-evals.json must contain exactly ten trigger cases");
  } else {
    const positives = triggerEvals.filter((item) => item.should_trigger === true);
    const negatives = triggerEvals.filter((item) => item.should_trigger === false);
    if (positives.length !== 5 || negatives.length !== 5) failures.push("trigger evals need five positive and five negative cases");
    triggerEvals.forEach((item, index) => {
      if (typeof item.query !== "string" || item.query.length < 50) failures.push(`trigger eval ${index + 1} needs a substantive query`);
      if (typeof item.should_trigger !== "boolean") failures.push(`trigger eval ${index + 1} needs should_trigger boolean`);
    });
    if (!negatives.some((item) => /release|changelog|commit|change/i.test(item.query))) failures.push("negative trigger evals need a realistic near-miss");
  }
} catch {
  failures.push("evals/trigger-evals.json is invalid JSON");
}

if (failures.length) {
  console.error("Skill validation failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log("Release skill has valid metadata, conditional progressive disclosure, a reusable extractor, and quality and trigger evals.");

import fs from "node:fs";
import path from "node:path";

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const failures = [];
const required = [
  "CONTEXT.md",
  "docs/decisions/001-ai-history-export.md",
  "evidence/before.md",
  "evidence/before.patch",
  "evidence/after.md",
  "evidence/after.patch",
  "evidence/comparison.md",
];
const read = (relative) => {
  const absolute = path.join(exerciseRoot, relative);
  if (!fs.existsSync(absolute)) {
    failures.push(`missing ${relative}`);
    return "";
  }
  const value = fs.readFileSync(absolute, "utf8");
  if (!value.trim()) failures.push(`${relative} is empty`);
  return value;
};
const files = Object.fromEntries(required.map((relative) => [relative, read(relative)]));

if (files["CONTEXT.md"]) {
  for (const term of ["billing customer", "workspace", "membership", "admin", "restricted"]) {
    if (!files["CONTEXT.md"].toLowerCase().includes(term)) failures.push(`CONTEXT.md does not define ${term}`);
  }
  if (files["CONTEXT.md"].split(/\s+/).length > 700) failures.push("CONTEXT.md exceeds 700 words");
}
if (files["docs/decisions/001-ai-history-export.md"]) {
  for (const term of ["decision", "enterprise", "same workspace", "suspended", "data residency"]) {
    if (!files["docs/decisions/001-ai-history-export.md"].toLowerCase().includes(term)) failures.push(`decision record is missing ${term}`);
  }
}
const field = (content, name) => content.match(new RegExp(`^- ${name}:\\s*(.+)$`, "mi"))?.[1].trim() ?? "";
for (const name of ["Agent", "Model", "Tools", "Permissions", "Time limit", "Prompt", "Attempt"]) {
  const before = field(files["evidence/before.md"], name);
  const after = field(files["evidence/after.md"], name);
  if (!before || !after) failures.push(`before.md and after.md must record ${name}`);
  if (before && after && before.toLowerCase() !== after.toLowerCase()) failures.push(`${name} differs between runs`);
}
if (field(files["evidence/before.md"], "Attempt") !== "1" || field(files["evidence/after.md"], "Attempt") !== "1") failures.push("both runs must be first attempts");
if (!/disabled/i.test(field(files["evidence/before.md"], "Domain Modeling skill")) || !/enabled/i.test(field(files["evidence/after.md"], "Domain Modeling skill"))) failures.push("skill boundary is not recorded");
for (const patch of ["evidence/before.patch", "evidence/after.patch"]) {
  if (!files[patch].includes("diff --git") || !files[patch].includes("aiHistoryExportPolicy.ts")) failures.push(`${patch} is not a genuine policy patch`);
}
if (files["evidence/before.patch"] === files["evidence/after.patch"]) failures.push("before and after patches must differ");

if (failures.length) {
  console.error("Domain submission verification failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}
console.log("Domain submission evidence is complete and comparable.");

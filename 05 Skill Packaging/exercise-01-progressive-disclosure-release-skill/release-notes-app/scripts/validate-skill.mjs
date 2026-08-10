import fs from "node:fs";
import path from "node:path";

const skillRoot = path.join(process.cwd(), ".agents", "skills", "release-notes");
const failures = [];
const required = ["SKILL.md", "references/release-policy.md", "scripts/extract-release.mjs", "evals/evals.json"];
const values = {};
for (const relative of required) {
  const absolute = path.join(skillRoot, relative);
  if (!fs.existsSync(absolute)) {
    failures.push(`missing ${path.relative(process.cwd(), absolute)}`);
    values[relative] = "";
  } else values[relative] = fs.readFileSync(absolute, "utf8");
}
const skill = values["SKILL.md"];
if (skill) {
  const frontmatter = skill.match(/^---\r?\n([\s\S]*?)\r?\n---/i)?.[1] ?? "";
  if (!/^name:\s*release-notes\s*$/mi.test(frontmatter)) failures.push("SKILL.md name must be release-notes");
  if (!/^description:\s*.+$/mi.test(frontmatter)) failures.push("SKILL.md needs a description");
  if (!/do not use|not for/i.test(frontmatter)) failures.push("description needs a negative trigger boundary");
  if (skill.split(/\r?\n/).length > 180) failures.push("SKILL.md exceeds 180 lines; move detail to resources");
  for (const link of ["references/release-policy.md", "scripts/extract-release.mjs"]) {
    if (!skill.includes(link)) failures.push(`SKILL.md does not route to ${link}`);
  }
  if ((skill.match(/customer-facing changes/gi) ?? []).length > 2) failures.push("publication policy appears duplicated in SKILL.md");
}
if (values["scripts/extract-release.mjs"] && !/git[\s\S]*(diff|log)/i.test(values["scripts/extract-release.mjs"])) failures.push("extract-release.mjs does not derive data from Git");
if (values["evals/evals.json"]) {
  try {
    const evals = JSON.parse(values["evals/evals.json"]);
    if (evals.skill_name !== "release-notes" || !Array.isArray(evals.evals) || evals.evals.length < 3) failures.push("evals/evals.json needs at least three release-notes evals");
    if (!evals.evals?.some((item) => /not|exclude|internal/i.test(JSON.stringify(item)))) failures.push("evals need a negative or exclusion case");
  } catch {
    failures.push("evals/evals.json is invalid JSON");
  }
}
if (failures.length) {
  console.error("Skill validation failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}
console.log("Release skill has valid metadata, progressive disclosure, a Git helper, and evals.");

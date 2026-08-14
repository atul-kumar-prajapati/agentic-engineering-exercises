import fs from "node:fs";
import path from "node:path";
import { skillManifest } from "./benchmark-lib.mjs";

const skillRoot = path.resolve("skills/incident-summary");
const skillPath = path.join(skillRoot, "SKILL.md");
const skill = fs.readFileSync(skillPath, "utf8");
const failures = [];
if (!/^---\r?\n[\s\S]*?name:\s*incident-summary[\s\S]*?description:\s*.+?\r?\n---/i.test(skill)) failures.push("SKILL.md metadata is invalid");
for (const term of ["source", "fact", "inference", "uncertainty", "recovery", "follow-up"]) if (!skill.toLowerCase().includes(term)) failures.push(`SKILL.md is missing ${term} guidance`);
for (const heading of ["timeline", "impact", "cause", "resolution", "follow-up"]) if (!skill.toLowerCase().includes(heading)) failures.push(`SKILL.md does not define the ${heading} output section`);
if (skill.split(/\r?\n/).length > 160) failures.push("SKILL.md exceeds 160 lines");
if (skill.split(/\s+/).filter(Boolean).length > 1200) failures.push("SKILL.md exceeds 1,200 words");
if (/\b(?:EVT|IMP|REM|HYP|NOTE|FUP|ACT|OBS|LOG|DRAFT)-[A-D]\d+[a-z]?\b/i.test(skill)) failures.push("SKILL.md leaks a protected fixture source ID");
if (/incident-[a-d]\.md/i.test(skill)) failures.push("SKILL.md leaks a protected eval filename");
let manifest;
try {
  manifest = skillManifest(skillRoot);
} catch (error) {
  failures.push(error.message);
}
if (failures.length) {
  console.error("Skill validation failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}
console.log(`Incident skill is concise, source-aware, free of fixture leakage, and has tree SHA-256 ${manifest.tree_sha256}.`);

import fs from "node:fs";

const skill = fs.readFileSync("skills/incident-summary/SKILL.md", "utf8");
const failures = [];
if (!/^---\r?\n[\s\S]*?name:\s*incident-summary[\s\S]*?description:\s*.+?\r?\n---/i.test(skill)) failures.push("SKILL.md metadata is invalid");
for (const term of ["source", "fact", "inference", "uncertainty", "follow-up"]) if (!skill.toLowerCase().includes(term)) failures.push(`SKILL.md is missing ${term} guidance`);
if (skill.split(/\r?\n/).length > 220) failures.push("SKILL.md exceeds 220 lines");
for (const leaked of ["EVT-A5", "IMP-B2", "EVT-C6", "IMP-D3"]) if (skill.includes(leaked)) failures.push(`SKILL.md leaks held answer ${leaked}`);
if (failures.length) {
  console.error("Skill validation failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}
console.log("Incident skill has source, fact, uncertainty, and follow-up guidance without answer leakage.");

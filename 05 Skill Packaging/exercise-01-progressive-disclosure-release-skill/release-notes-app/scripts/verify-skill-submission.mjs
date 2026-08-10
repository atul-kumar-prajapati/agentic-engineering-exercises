import fs from "node:fs";
import path from "node:path";

const exerciseRoot = path.resolve(process.cwd(), "..");
const failures = [];
const required = [
  "evidence/before.md",
  "evidence/before-output.md",
  "evidence/after.md",
  "evidence/after-output.md",
  "evidence/comparison.md",
];
const values = {};
for (const relative of required) {
  const absolute = path.join(exerciseRoot, relative);
  if (!fs.existsSync(absolute)) {
    failures.push(`missing ${relative}`);
    values[relative] = "";
  } else values[relative] = fs.readFileSync(absolute, "utf8");
}
for (const name of ["agent", "model", "time limit", "attempt", "skill", "exit code"]) {
  if (!values["evidence/before.md"].toLowerCase().includes(name) || !values["evidence/after.md"].toLowerCase().includes(name)) failures.push(`before.md and after.md must both record ${name}`);
}
if (!/attempt[^\n]*1/i.test(values["evidence/before.md"]) || !/attempt[^\n]*1/i.test(values["evidence/after.md"])) failures.push("both runs must be first attempts");
if (!/disabled/i.test(values["evidence/before.md"]) || !/enabled/i.test(values["evidence/after.md"])) failures.push("skill boundary is not recorded");
for (const term of ["breaking", "missing evidence", "trace:"]) {
  if (!values["evidence/after-output.md"].toLowerCase().includes(term)) failures.push(`after output is missing ${term}`);
}
if (/telemetry cleanup|clean events/i.test(values["evidence/after-output.md"])) failures.push("after output publishes internal telemetry");
for (const term of ["progressive disclosure", "context", "accuracy", "verification"]) {
  if (!values["evidence/comparison.md"].toLowerCase().includes(term)) failures.push(`comparison.md is missing ${term}`);
}
if (failures.length) {
  console.error("Skill submission verification failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}
console.log("Release skill comparison evidence is complete.");

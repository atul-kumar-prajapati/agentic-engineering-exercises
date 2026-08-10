import fs from "node:fs";
import path from "node:path";

const exerciseRoot = path.resolve(process.cwd(), "..");
const failures = [];
const required = ["evidence/claim-audit.md", "evidence/verification-plan.md", "evidence/final-verification.txt"];
const values = {};
for (const relative of required) {
  const absolute = path.join(exerciseRoot, relative);
  if (!fs.existsSync(absolute)) {
    failures.push(`missing ${relative}`);
    values[relative] = "";
  } else values[relative] = fs.readFileSync(absolute, "utf8");
}
for (const term of ["workflowservicetest", "does not prove", "client", "exit code"]) {
  if (!values["evidence/claim-audit.md"].toLowerCase().includes(term)) failures.push(`claim-audit.md is missing ${term}`);
}
for (const term of ["node scripts/verification-gate.mjs", "client release tests", "client quality", "provider tests", "failure stops"]) {
  if (!values["evidence/verification-plan.md"].toLowerCase().includes(term)) failures.push(`verification-plan.md is missing ${term}`);
}
const output = values["evidence/final-verification.txt"].toLowerCase();
for (const term of ["verify client release tests", "pass client quality and build", "pass provider tests and build", "exit code: 0", "verified release gate passed"]) {
  if (!output.includes(term)) failures.push(`final-verification.txt is missing ${term}`);
}
if (failures.length) {
  console.error("Release submission verification failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}
console.log("Release claim audit and fresh full-gate evidence are present.");

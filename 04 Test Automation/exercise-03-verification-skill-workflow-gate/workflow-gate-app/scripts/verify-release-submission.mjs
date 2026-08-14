import fs from "node:fs";
import path from "node:path";

const exerciseRoot = path.resolve(process.cwd(), "..");
const failures = [];
const required = [
  "evidence/before.md",
  "evidence/before.patch",
  "evidence/after.md",
  "evidence/after.patch",
  "evidence/skill-record.md",
  "evidence/claim-audit.md",
  "evidence/verification-plan.md",
  "evidence/gate-contract.txt",
  "evidence/final-verification.txt",
  "evidence/comparison.md",
];
const values = {};

for (const relative of required) {
  const absolute = path.join(exerciseRoot, relative);
  if (!fs.existsSync(absolute)) {
    failures.push(`missing ${relative}`);
    values[relative] = "";
    continue;
  }
  values[relative] = fs.readFileSync(absolute, "utf8");
  if (values[relative].trim().length < 80) failures.push(`${relative} is too short to contain the required evidence`);
}

const lower = (file) => values[file].toLowerCase();
const requireTerms = (file, terms) => {
  for (const term of terms) {
    if (!lower(file).includes(term.toLowerCase())) failures.push(`${file} is missing ${term}`);
  }
};

for (const file of ["evidence/before.md", "evidence/after.md"]) {
  requireTerms(file, [
    "agent:",
    "model:",
    "other tools:",
    "permissions:",
    "time limit:",
    "attempt: 1",
    "audit the previous release claim",
    "verification before completion skill:",
    "changed files",
    "exit code",
  ]);
}
if (!/verification before completion skill:\s*disabled/i.test(values["evidence/before.md"])) {
  failures.push("before.md must record the skill as disabled");
}
if (!/verification before completion skill:\s*enabled/i.test(values["evidence/after.md"])) {
  failures.push("after.md must record the skill as enabled");
}

for (const file of ["evidence/before.patch", "evidence/after.patch"]) {
  if (!/^diff --git /m.test(values[file]) || !/^@@/m.test(values[file])) {
    failures.push(`${file} must contain a genuine Git patch`);
  }
}
if (values["evidence/before.patch"] === values["evidence/after.patch"]) {
  failures.push("before.patch and after.patch must not be identical");
}
requireTerms("evidence/after.patch", ["workflowContractClient", "WorkflowService", "verification-gate.mjs"]);

const skillRecord = values["evidence/skill-record.md"];
requireTerms("evidence/skill-record.md", [
  "https://github.com/obra/superpowers/tree/main/skills/verification-before-completion",
  "npx skills add obra/superpowers --skill verification-before-completion",
  "source commit:",
  "installed path:",
  "skill.md sha-256:",
]);
if (!/source commit:\s*[a-f0-9]{40}\b/i.test(skillRecord)) failures.push("skill-record.md needs a 40-character source commit");
if (!/skill\.md sha-256:\s*[a-f0-9]{64}\b/i.test(skillRecord)) failures.push("skill-record.md needs a 64-character SKILL.md hash");
if (!/installed path:.*verification-before-completion[\\/]skill\.md/i.test(skillRecord)) {
  failures.push("skill-record.md needs the installed verification-before-completion/SKILL.md path");
}

requireTerms("evidence/claim-audit.md", [
  "-Dtest=WorkflowServiceTest",
  "exit code 0",
  "does not prove",
  "client contract",
  "complete provider",
  "build",
  "gate",
]);
requireTerms("evidence/verification-plan.md", [
  "decisionState",
  "unknown transition",
  "npm run test:gate",
  "npm run test:release",
  "npm run agent:check",
  "mvnw",
  "verify",
  "failure stops",
  "expected result",
]);
requireTerms("evidence/gate-contract.txt", [
  "npm run test:gate",
  "success path runs all four",
  "preserves a non-zero",
  "process-spawn error",
  "exit code: 0",
]);
requireTerms("evidence/final-verification.txt", [
  "implementation commit:",
  "date:",
  "node scripts/verification-gate.mjs",
  "verify gate-contract",
  "pass client-release",
  "pass client-quality-build",
  "pass provider-tests-build",
  "verified release gate passed",
  "exit code: 0",
]);
if (!/implementation commit:\s*[a-f0-9]{40}\b/i.test(values["evidence/final-verification.txt"])) {
  failures.push("final-verification.txt needs the 40-character implementation commit");
}
if (!/date:\s*\d{4}-\d{2}-\d{2}t\d{2}:\d{2}/i.test(values["evidence/final-verification.txt"])) {
  failures.push("final-verification.txt needs an ISO-8601 verification date");
}
requireTerms("evidence/comparison.md", [
  "same prompt",
  "same agent",
  "same model",
  "same tools",
  "same permissions",
  "same time limit",
  "skill was the only changed input",
  "claim coverage",
  "failure handling",
  "fresh evidence",
  "changed files",
]);

if (failures.length) {
  console.error("Release submission verification failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log("Comparable runs, skill provenance, claim audit, gate proof, and fresh release evidence are present.");

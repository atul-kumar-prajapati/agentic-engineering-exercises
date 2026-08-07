import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
function findFiles(directory, relative = "") {
  const results = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "target" || entry.name === ".git") continue;
    const nextRelative = path.join(relative, entry.name);
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) results.push(...findFiles(absolute, nextRelative));
    if (entry.isFile()) results.push(nextRelative);
  }
  return results;
}

const files = findFiles(root);
const readmes = files.filter((relative) => path.basename(relative) === "README.md" && relative.split(path.sep).some((part) => part.startsWith("exercise-")));
assert.equal(readmes.length, 34, `Expected 34 exercise READMEs, found ${readmes.length}`);
const headings = ["Required Implementation Changes", "Allowed Changes", "Required Commands", "Acceptance Criteria", "Evidence Contract", "Incomplete When", "Evaluation Rubric"];
for (const relative of readmes) {
  const source = readFileSync(path.join(root, relative), "utf8");
  for (const heading of headings) assert.ok(source.includes(`## ${heading}`), `${relative} is missing ${heading}`);
  assert.ok(source.includes("docs/SUBMISSION_STANDARD.md"), `${relative} does not link to the submission standard`);
  assert.ok(source.includes("docs/EVALUATION_RUBRICS.md"), `${relative} does not link to the evaluation rubric`);
}
const requiredArtifacts = [
  "04 Test Automation/exercise-01-playwright-mcp-checkout-rescue/checkout-e2e-app/tests/e2e/starter-smoke.spec.ts",
  "04 Test Automation/exercise-02-msw-component-network-boundaries/case-dashboard-app/src/test/server.ts",
  "05 Skill Packaging/exercise-01-release-notes-agent-skill-factory/fixtures/release-history.bundle",
  "05 Skill Packaging/exercise-02-jscodeshift-migration-playbook-skill/migration-playbook-app/fixtures/input/LegacyAction.tsx",
  "05 Skill Packaging/exercise-03-promptfoo-skill-trigger-eval-harness/skill-eval-app/skills/security-review/SKILL.md",
  "09 Code Review/exercise-01-security-and-a11y-review-gauntlet/fixtures/review-target.bundle",
  "09 Code Review/exercise-02-diff-triage-with-fresh-agent/fixtures/review-target.bundle"
];
for (const relative of requiredArtifacts) assert.ok(existsSync(path.join(root, relative)), `Missing starter artifact: ${relative}`);

const packageFiles = files.filter((relative) => path.basename(relative) === "package.json");
assert.equal(packageFiles.length, 36, `Expected 36 package.json files, found ${packageFiles.length}`);
for (const relative of packageFiles) {
  const lockfile = path.join(path.dirname(relative), "package-lock.json");
  assert.ok(files.includes(lockfile), `${relative} is missing its committed package-lock.json`);
}
assert.equal(readFileSync(path.join(root, ".nvmrc"), "utf8").trim(), "22.12.0", "Unexpected Node version");
assert.equal(readFileSync(path.join(root, ".java-version"), "utf8").trim(), "21", "Unexpected Java version");

const pomFiles = files.filter((relative) => path.basename(relative) === "pom.xml");
assert.equal(pomFiles.length, 2, `Expected two Maven projects, found ${pomFiles.length}`);
for (const relative of pomFiles) {
  const project = path.dirname(relative);
  for (const wrapperFile of ["mvnw", "mvnw.cmd", path.join(".mvn", "wrapper", "maven-wrapper.jar"), path.join(".mvn", "wrapper", "maven-wrapper.properties")]) {
    assert.ok(files.includes(path.join(project, wrapperFile)), `${relative} is missing ${wrapperFile}`);
  }
}

console.log(`Verified ${readmes.length} exercise contracts, ${requiredArtifacts.length} real starter artifacts, ${packageFiles.length} npm lockfiles, and ${pomFiles.length} Maven wrappers.`);

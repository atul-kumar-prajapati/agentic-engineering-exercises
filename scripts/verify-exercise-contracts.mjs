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
const detailedHeadings = ["Required Implementation Changes", "Allowed Changes", "Required Commands", "Acceptance Criteria", "Evidence Contract", "Incomplete When", "Evaluation Rubric"];
const challengeHeadings = ["Your Mission", "Project", "How To Go About It", "Evidence", "Evaluation"];
const challengeReadmes = new Set([
  path.normalize("01 Toolchain Setup/exercise-01-agent-onboarding-kit/README.md"),
  path.normalize("01 Toolchain Setup/exercise-02-agent-guardrails/README.md"),
  path.normalize("02 Spec Framing/exercise-01-spec-driven-feature-development/README.md"),
  path.normalize("02 Spec Framing/exercise-02-superpowers-skill-driven-development/README.md"),
  path.normalize("03 Context Engineering/exercise-01-handoff-skill-incident-rescue/README.md"),
  path.normalize("03 Context Engineering/exercise-02-domain-modeling-product-rules-rescue/README.md"),
  path.normalize("03 Context Engineering/exercise-03-graphify-billing-knowledge-graph/README.md"),
  path.normalize("04 Test Automation/exercise-01-playwright-mcp-checkout-rescue/README.md"),
  path.normalize("04 Test Automation/exercise-02-tdd-skill-network-boundary-rescue/README.md"),
  path.normalize("04 Test Automation/exercise-03-verification-skill-workflow-gate/README.md"),
  path.normalize("05 Skill Packaging/exercise-01-progressive-disclosure-release-skill/README.md"),
  path.normalize("05 Skill Packaging/exercise-02-skill-trigger-boundary-evals/README.md"),
  path.normalize("05 Skill Packaging/exercise-03-skill-benchmark-package-gate/README.md"),
]);
for (const relative of readmes) {
  const source = readFileSync(path.join(root, relative), "utf8");
  const headings = challengeReadmes.has(relative) ? challengeHeadings : detailedHeadings;
  for (const heading of headings) assert.ok(source.includes(`## ${heading}`), `${relative} is missing ${heading}`);
  assert.ok(source.includes("docs/SUBMISSION_STANDARD.md"), `${relative} does not link to the submission standard`);
  assert.ok(source.includes("docs/EVALUATION_RUBRICS.md"), `${relative} does not link to the evaluation rubric`);
}
const requiredArtifacts = [
  "01 Toolchain Setup/exercise-02-agent-guardrails/yolo-agent-app/tasks/release-readiness.md",
  "01 Toolchain Setup/exercise-02-agent-guardrails/yolo-agent-app/fixtures/production-customer-export.json",
  "01 Toolchain Setup/exercise-02-agent-guardrails/yolo-agent-app/fixtures/public-workflow-sample.json",
  "02 Spec Framing/exercise-01-spec-driven-feature-development/subscription-management-app/docs/stakeholder-notes.md",
  "02 Spec Framing/exercise-01-spec-driven-feature-development/subscription-management-app/docs/billing-constraints.md",
  "02 Spec Framing/exercise-01-spec-driven-feature-development/subscription-management-app/scripts/challenge-integrity.json",
  "02 Spec Framing/exercise-02-superpowers-skill-driven-development/team-collaboration-app/docs/support-incidents.md",
  "02 Spec Framing/exercise-02-superpowers-skill-driven-development/team-collaboration-app/src/legacy/quickInvite.ts",
  "02 Spec Framing/exercise-02-superpowers-skill-driven-development/team-collaboration-app/tests/invitationService.test.ts",
  "02 Spec Framing/exercise-02-superpowers-skill-driven-development/team-collaboration-app/scripts/challenge-integrity.json",
  "03 Context Engineering/exercise-01-handoff-skill-incident-rescue/docs/evidence-template.md",
  "03 Context Engineering/exercise-01-handoff-skill-incident-rescue/bugfix-context-app/incidents/INC-2047.md",
  "03 Context Engineering/exercise-01-handoff-skill-incident-rescue/bugfix-context-app/docs/raw-session-history.md",
  "03 Context Engineering/exercise-01-handoff-skill-incident-rescue/bugfix-context-app/docs/failed-test-output.txt",
  "03 Context Engineering/exercise-01-handoff-skill-incident-rescue/bugfix-context-app/docs/current-sla-policy.md",
  "03 Context Engineering/exercise-01-handoff-skill-incident-rescue/bugfix-context-app/docs/sla-rollout-proposal.md",
  "03 Context Engineering/exercise-01-handoff-skill-incident-rescue/bugfix-context-app/scripts/run-incident-tests.mjs",
  "03 Context Engineering/exercise-01-handoff-skill-incident-rescue/bugfix-context-app/scripts/verify-handoff.mjs",
  "03 Context Engineering/exercise-01-handoff-skill-incident-rescue/bugfix-context-app/scripts/challenge-integrity.json",
  "03 Context Engineering/exercise-02-domain-modeling-product-rules-rescue/docs/current-access-policy.md",
  "03 Context Engineering/exercise-02-domain-modeling-product-rules-rescue/docs/legacy-rollout-notes.md",
  "03 Context Engineering/exercise-02-domain-modeling-product-rules-rescue/product-rules-app/src/services/aiHistoryExportPolicy.ts",
  "03 Context Engineering/exercise-02-domain-modeling-product-rules-rescue/product-rules-app/scripts/run-product-rule-tests.mjs",
  "03 Context Engineering/exercise-02-domain-modeling-product-rules-rescue/product-rules-app/challenge-integrity.json",
  "03 Context Engineering/exercise-03-graphify-billing-knowledge-graph/docs/current-metric-contract.md",
  "03 Context Engineering/exercise-03-graphify-billing-knowledge-graph/billing-graph-app/src/billing/recognizedRevenue.ts",
  "03 Context Engineering/exercise-03-graphify-billing-knowledge-graph/billing-graph-app/scripts/run-billing-tests.mjs",
  "03 Context Engineering/exercise-03-graphify-billing-knowledge-graph/billing-graph-app/challenge-integrity.json",
  "04 Test Automation/exercise-01-playwright-mcp-checkout-rescue/checkout-e2e-app/tests/e2e/starter-smoke.spec.ts",
  "04 Test Automation/exercise-01-playwright-mcp-checkout-rescue/checkout-e2e-app/scripts/verify-checkout-submission.mjs",
  "04 Test Automation/exercise-01-playwright-mcp-checkout-rescue/checkout-e2e-app/challenge-integrity.json",
  "04 Test Automation/exercise-02-tdd-skill-network-boundary-rescue/case-dashboard-app/src/test/server.ts",
  "04 Test Automation/exercise-02-tdd-skill-network-boundary-rescue/case-dashboard-app/src/App.acceptance.test.tsx",
  "04 Test Automation/exercise-02-tdd-skill-network-boundary-rescue/case-dashboard-app/challenge-integrity.json",
  "04 Test Automation/exercise-03-verification-skill-workflow-gate/scripts/verification-gate.mjs",
  "04 Test Automation/exercise-03-verification-skill-workflow-gate/workflow-rules-api/src/test/java/dev/agentic/exercise/workflow/WorkflowReleaseGateTest.java",
  "04 Test Automation/exercise-03-verification-skill-workflow-gate/workflow-gate-app/challenge-integrity.json",
  "05 Skill Packaging/exercise-01-progressive-disclosure-release-skill/fixtures/release-history.bundle",
  "05 Skill Packaging/exercise-01-progressive-disclosure-release-skill/docs/monolithic-skill-draft.md",
  "05 Skill Packaging/exercise-01-progressive-disclosure-release-skill/release-notes-app/challenge-integrity.json",
  "05 Skill Packaging/exercise-02-skill-trigger-boundary-evals/skill-trigger-app/evals/trigger-evals.json",
  "05 Skill Packaging/exercise-02-skill-trigger-boundary-evals/skill-trigger-app/skills/change-review/SKILL.md",
  "05 Skill Packaging/exercise-02-skill-trigger-boundary-evals/skill-trigger-app/challenge-integrity.json",
  "05 Skill Packaging/exercise-03-skill-benchmark-package-gate/skill-benchmark-app/evals/evals.json",
  "05 Skill Packaging/exercise-03-skill-benchmark-package-gate/skill-benchmark-app/skills/incident-summary/SKILL.md",
  "05 Skill Packaging/exercise-03-skill-benchmark-package-gate/skill-benchmark-app/challenge-integrity.json",
  "09 Code Review/exercise-01-security-and-a11y-review-gauntlet/fixtures/review-target.bundle",
  "09 Code Review/exercise-02-diff-triage-with-fresh-agent/fixtures/review-target.bundle"
];
for (const relative of requiredArtifacts) assert.ok(existsSync(path.join(root, relative)), `Missing starter artifact: ${relative}`);

const packageFiles = files.filter((relative) => path.basename(relative) === "package.json");
assert.equal(packageFiles.length, 35, `Expected 35 package.json files, found ${packageFiles.length}`);
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

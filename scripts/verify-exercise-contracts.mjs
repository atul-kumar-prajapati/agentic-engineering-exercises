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
const challengeHeadings = ["Your Mission", "Project", "How To Go About It", "Evidence", "Completion Criteria"];
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
  path.normalize("06 Multi-Agent Workflows/exercise-01-parallel-worktree-feature-split/README.md"),
  path.normalize("06 Multi-Agent Workflows/exercise-02-specialist-subagent-nfr-review/README.md"),
  path.normalize("06 Multi-Agent Workflows/exercise-03-agent-ready-kanban-control-plane/README.md"),
  path.normalize("07 Docs & Diagrams/exercise-01-workflow-diagram-reconstruction/README.md"),
  path.normalize("07 Docs & Diagrams/exercise-02-codebase-graph-to-diagrams/README.md"),
  path.normalize("07 Docs & Diagrams/exercise-03-feature-visualization/README.md"),
  path.normalize("08 Evidence-led PRs/exercise-01-pr-evidence-pack-automation/README.md"),
  path.normalize("08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/README.md"),
  path.normalize("08 Evidence-led PRs/exercise-03-performance-and-a11y-evidence-gate/README.md"),
  path.normalize("09 Code Review/exercise-01-security-and-a11y-review-gauntlet/README.md"),
  path.normalize("09 Code Review/exercise-02-diff-triage-with-fresh-agent/README.md"),
  path.normalize("09 Code Review/exercise-03-review-regression-lab/README.md"),
  path.normalize("10 Token Economics/exercise-01-token-budget-refactor/README.md"),
  path.normalize("10 Token Economics/exercise-02-risk-based-model-routing-cost-gate/README.md"),
  path.normalize("10 Token Economics/exercise-03-minimal-diff-scope-budget/README.md"),
  path.normalize("11 Agentic Refactoring/exercise-01-characterization-test-refactor/README.md"),
  path.normalize("11 Agentic Refactoring/exercise-02-strangler-pattern-checkout/README.md"),
  path.normalize("11 Agentic Refactoring/exercise-03-legacy-rules-engine-untangle/README.md"),
  path.normalize("12 Agentic Retrospective/exercise-01-session-waste-retro-from-logs/README.md"),
  path.normalize("12 Agentic Retrospective/exercise-02-rule-hardening-from-repeated-mistakes/README.md"),
  path.normalize("12 Agentic Retrospective/exercise-03-trace-backed-workflow-optimizer/README.md"),
]);
for (const relative of readmes) {
  const source = readFileSync(path.join(root, relative), "utf8");
  const headings = challengeHeadings;
  for (const heading of headings) assert.ok(source.includes(`## ${heading}`), `${relative} is missing ${heading}`);
  assert.ok(!source.includes("## Evaluation"), `${relative} still contains an evaluation rubric`);
  assert.ok(source.includes("docs/SUBMISSION_STANDARD.md"), `${relative} does not link to the submission standard`);
  for (const artifact of ["evidence/before.md", "evidence/before.patch", "evidence/after.md", "evidence/after.patch", "evidence/comparison.md"]) {
    assert.ok(source.includes(artifact), `${relative} does not require ${artifact}`);
  }
  assert.ok(
    source.includes("[evidence instructions and template](./docs/evidence-template.md)"),
    `${relative} does not direct before/after evidence to its instructions and template`,
  );
  assert.ok(source.includes("npm run verify:exercise"), `${relative} does not identify the final verification command`);
  const evidenceTemplate = path.join(path.dirname(relative), "docs", "evidence-template.md");
  assert.ok(files.includes(evidenceTemplate), `${relative} is missing docs/evidence-template.md`);
  const evidenceSource = readFileSync(path.join(root, evidenceTemplate), "utf8");
  for (const artifact of ["before.md", "before.patch", "after.md", "after.patch", "comparison.md"]) {
    assert.ok(evidenceSource.includes(artifact), `${evidenceTemplate} does not explain ${artifact}`);
  }
}
const requiredArtifacts = [
  "01 Toolchain Setup/exercise-01-agent-onboarding-kit/agent-onboarding-app/scripts/verify-implementation.mjs",
  "01 Toolchain Setup/exercise-01-agent-onboarding-kit/agent-onboarding-app/challenge-integrity.json",
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
  "04 Test Automation/exercise-03-verification-skill-workflow-gate/docs/evidence-template.md",
  "04 Test Automation/exercise-03-verification-skill-workflow-gate/scripts/previous-release-check.mjs",
  "04 Test Automation/exercise-03-verification-skill-workflow-gate/scripts/verification-gate.mjs",
  "04 Test Automation/exercise-03-verification-skill-workflow-gate/workflow-gate-app/scripts/verify-gate-contract.mjs",
  "04 Test Automation/exercise-03-verification-skill-workflow-gate/workflow-rules-api/src/test/java/dev/agentic/exercise/workflow/WorkflowReleaseGateTest.java",
  "04 Test Automation/exercise-03-verification-skill-workflow-gate/workflow-gate-app/challenge-integrity.json",
  "05 Skill Packaging/exercise-01-progressive-disclosure-release-skill/fixtures/release-history.bundle",
  "05 Skill Packaging/exercise-01-progressive-disclosure-release-skill/docs/monolithic-skill-draft.md",
  "05 Skill Packaging/exercise-01-progressive-disclosure-release-skill/docs/eval-scenarios.md",
  "05 Skill Packaging/exercise-01-progressive-disclosure-release-skill/release-notes-app/scripts/materialize-fixture.mjs",
  "05 Skill Packaging/exercise-01-progressive-disclosure-release-skill/release-notes-app/scripts/verify-extractor.mjs",
  "05 Skill Packaging/exercise-01-progressive-disclosure-release-skill/release-notes-app/challenge-integrity.json",
  "05 Skill Packaging/exercise-02-skill-trigger-boundary-evals/skill-trigger-app/evals/trigger-evals.json",
  "05 Skill Packaging/exercise-02-skill-trigger-boundary-evals/docs/evidence-template.md",
  "05 Skill Packaging/exercise-02-skill-trigger-boundary-evals/skill-trigger-app/fixtures/change-review-baseline/SKILL.md",
  "05 Skill Packaging/exercise-02-skill-trigger-boundary-evals/skill-trigger-app/scripts/score-trigger-results.mjs",
  "05 Skill Packaging/exercise-02-skill-trigger-boundary-evals/skill-trigger-app/scripts/test-trigger-evaluation.mjs",
  "05 Skill Packaging/exercise-02-skill-trigger-boundary-evals/skill-trigger-app/scripts/validate-change-review-skill.mjs",
  "05 Skill Packaging/exercise-02-skill-trigger-boundary-evals/skill-trigger-app/scripts/verify-trigger-submission.mjs",
  "05 Skill Packaging/exercise-02-skill-trigger-boundary-evals/skill-trigger-app/skills/change-review/SKILL.md",
  "05 Skill Packaging/exercise-02-skill-trigger-boundary-evals/skill-trigger-app/challenge-integrity.json",
  "05 Skill Packaging/exercise-03-skill-benchmark-package-gate/skill-benchmark-app/evals/evals.json",
  "05 Skill Packaging/exercise-03-skill-benchmark-package-gate/docs/evidence-template.md",
  "05 Skill Packaging/exercise-03-skill-benchmark-package-gate/docs/incident-output-contract.md",
  "05 Skill Packaging/exercise-03-skill-benchmark-package-gate/skill-benchmark-app/fixtures/incident-summary-starter/SKILL.md",
  "05 Skill Packaging/exercise-03-skill-benchmark-package-gate/skill-benchmark-app/scripts/aggregate-benchmark.mjs",
  "05 Skill Packaging/exercise-03-skill-benchmark-package-gate/skill-benchmark-app/scripts/grade-incident-output.mjs",
  "05 Skill Packaging/exercise-03-skill-benchmark-package-gate/skill-benchmark-app/scripts/package-skill.py",
  "05 Skill Packaging/exercise-03-skill-benchmark-package-gate/skill-benchmark-app/scripts/test-package-framework.py",
  "05 Skill Packaging/exercise-03-skill-benchmark-package-gate/skill-benchmark-app/scripts/verify-skill-package.py",
  "05 Skill Packaging/exercise-03-skill-benchmark-package-gate/skill-benchmark-app/skills/incident-summary/SKILL.md",
  "05 Skill Packaging/exercise-03-skill-benchmark-package-gate/skill-benchmark-app/challenge-integrity.json",
  "09 Code Review/exercise-01-security-and-a11y-review-gauntlet/fixtures/review-target.bundle",
  "09 Code Review/exercise-02-diff-triage-with-fresh-agent/fixtures/review-target.bundle",
  "06 Multi-Agent Workflows/exercise-01-parallel-worktree-feature-split/worktree-feature-app/submission-contract.json",
  "06 Multi-Agent Workflows/exercise-01-parallel-worktree-feature-split/docs/evidence-template.md",
  "06 Multi-Agent Workflows/exercise-01-parallel-worktree-feature-split/docs/integration-contract.md",
  "06 Multi-Agent Workflows/exercise-01-parallel-worktree-feature-split/worktree-feature-app/acceptance/lane-a.saved-filters.test.tsx",
  "06 Multi-Agent Workflows/exercise-01-parallel-worktree-feature-split/worktree-feature-app/acceptance/lane-b.sla-risk.test.tsx",
  "06 Multi-Agent Workflows/exercise-01-parallel-worktree-feature-split/worktree-feature-app/acceptance/lane-c.evidence-export.test.tsx",
  "06 Multi-Agent Workflows/exercise-01-parallel-worktree-feature-split/worktree-feature-app/scripts/worktree-verification.mjs",
  "06 Multi-Agent Workflows/exercise-01-parallel-worktree-feature-split/worktree-feature-app/scripts/test-worktree-verifier.mjs",
  "06 Multi-Agent Workflows/exercise-02-specialist-subagent-nfr-review/nfr-swarm-app/submission-contract.json",
  "06 Multi-Agent Workflows/exercise-02-specialist-subagent-nfr-review/docs/evidence-template.md",
  "06 Multi-Agent Workflows/exercise-02-specialist-subagent-nfr-review/docs/remediation-contract.md",
  "06 Multi-Agent Workflows/exercise-02-specialist-subagent-nfr-review/nfr-swarm-app/acceptance/security.review.test.tsx",
  "06 Multi-Agent Workflows/exercise-02-specialist-subagent-nfr-review/nfr-swarm-app/acceptance/accessibility.review.test.tsx",
  "06 Multi-Agent Workflows/exercise-02-specialist-subagent-nfr-review/nfr-swarm-app/acceptance/performance.review.test.ts",
  "06 Multi-Agent Workflows/exercise-02-specialist-subagent-nfr-review/nfr-swarm-app/acceptance/testability.review.test.ts",
  "06 Multi-Agent Workflows/exercise-02-specialist-subagent-nfr-review/nfr-swarm-app/scripts/measure-performance.mjs",
  "06 Multi-Agent Workflows/exercise-02-specialist-subagent-nfr-review/nfr-swarm-app/scripts/specialist-review-verification.mjs",
  "06 Multi-Agent Workflows/exercise-02-specialist-subagent-nfr-review/nfr-swarm-app/scripts/test-specialist-review-verifier.mjs",
  "06 Multi-Agent Workflows/exercise-03-agent-ready-kanban-control-plane/kanban-control-app/submission-contract.json",
  "06 Multi-Agent Workflows/exercise-03-agent-ready-kanban-control-plane/docs/evidence-template.md",
  "06 Multi-Agent Workflows/exercise-03-agent-ready-kanban-control-plane/kanban-control-app/acceptance/esc-120.inherited-severity.test.tsx",
  "06 Multi-Agent Workflows/exercise-03-agent-ready-kanban-control-plane/kanban-control-app/scripts/board-verification.mjs",
  "06 Multi-Agent Workflows/exercise-03-agent-ready-kanban-control-plane/kanban-control-app/scripts/control-plane-verification.mjs",
  "06 Multi-Agent Workflows/exercise-03-agent-ready-kanban-control-plane/kanban-control-app/scripts/run-feature-check.mjs",
  "06 Multi-Agent Workflows/exercise-03-agent-ready-kanban-control-plane/kanban-control-app/scripts/test-control-plane-verifier.mjs",
  "07 Docs & Diagrams/exercise-01-workflow-diagram-reconstruction/docs/legacy-workflow-description.md",
  "07 Docs & Diagrams/exercise-01-workflow-diagram-reconstruction/docs/diagram-contract.md",
  "07 Docs & Diagrams/exercise-01-workflow-diagram-reconstruction/docs/evidence-template.md",
  "07 Docs & Diagrams/exercise-01-workflow-diagram-reconstruction/workflow-reconstruction-app/scripts/diagram-verification.mjs",
  "07 Docs & Diagrams/exercise-01-workflow-diagram-reconstruction/workflow-reconstruction-app/scripts/mermaid-parser.mjs",
  "07 Docs & Diagrams/exercise-01-workflow-diagram-reconstruction/workflow-reconstruction-app/scripts/parse-diagrams.mjs",
  "07 Docs & Diagrams/exercise-01-workflow-diagram-reconstruction/workflow-reconstruction-app/scripts/trace-workflow.mjs",
  "07 Docs & Diagrams/exercise-01-workflow-diagram-reconstruction/workflow-reconstruction-app/scripts/test-diagram-verifier.mjs",
  "07 Docs & Diagrams/exercise-01-workflow-diagram-reconstruction/workflow-reconstruction-app/scripts/verify-diagrams.mjs",
  "07 Docs & Diagrams/exercise-02-codebase-graph-to-diagrams/notification-mesh-app/scripts/run-routing-tests.mjs",
  "07 Docs & Diagrams/exercise-02-codebase-graph-to-diagrams/docs/graph-contract.md",
  "07 Docs & Diagrams/exercise-02-codebase-graph-to-diagrams/docs/evidence-template.md",
  "07 Docs & Diagrams/exercise-02-codebase-graph-to-diagrams/notification-mesh-app/scripts/code-graph.mjs",
  "07 Docs & Diagrams/exercise-02-codebase-graph-to-diagrams/notification-mesh-app/scripts/graph-verification.mjs",
  "07 Docs & Diagrams/exercise-02-codebase-graph-to-diagrams/notification-mesh-app/scripts/test-code-graph.mjs",
  "07 Docs & Diagrams/exercise-02-codebase-graph-to-diagrams/notification-mesh-app/scripts/test-graph-verifier.mjs",
  "07 Docs & Diagrams/exercise-03-feature-visualization/payment-workflow-app/scripts/run-webhook-tests.mjs",
  "07 Docs & Diagrams/exercise-03-feature-visualization/docs/diagram-contract.md",
  "07 Docs & Diagrams/exercise-03-feature-visualization/docs/evidence-template.md",
  "07 Docs & Diagrams/exercise-03-feature-visualization/payment-workflow-app/scripts/run-payment-tests.ts",
  "07 Docs & Diagrams/exercise-03-feature-visualization/payment-workflow-app/scripts/visualization-verification.mjs",
  "07 Docs & Diagrams/exercise-03-feature-visualization/payment-workflow-app/scripts/test-visualization-verifier.mjs",
  "08 Evidence-led PRs/exercise-01-pr-evidence-pack-automation/fixtures/check-results.json",
  "08 Evidence-led PRs/exercise-01-pr-evidence-pack-automation/fixtures/check-results-pass.json",
  "08 Evidence-led PRs/exercise-01-pr-evidence-pack-automation/fixtures/artifacts/checkout-smoke.txt",
  "08 Evidence-led PRs/exercise-01-pr-evidence-pack-automation/fixtures/artifacts/checkout.svg",
  "08 Evidence-led PRs/exercise-01-pr-evidence-pack-automation/docs/evidence-contract.md",
  "08 Evidence-led PRs/exercise-01-pr-evidence-pack-automation/docs/action-pins.json",
  "08 Evidence-led PRs/exercise-01-pr-evidence-pack-automation/pr-evidence-app/scripts/evidence-verification.mjs",
  "08 Evidence-led PRs/exercise-01-pr-evidence-pack-automation/pr-evidence-app/scripts/test-evidence-verifier.mjs",
  "08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/scripts/run-rollout-tests.mjs",
  "08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/docs/rollback-contract.md",
  "08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/docs/evidence-contract.md",
  "08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/config/invoice-preview.json",
  "08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/fixtures/rollout-scenarios.json",
  "08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/scripts/rollout-harness.mjs",
  "08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/scripts/capture-rollout-evidence.mjs",
  "08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/scripts/run-rollback-drill.mjs",
  "08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/scripts/rollout-verification.mjs",
  "08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/scripts/test-rollout-verifier.mjs",
  "08 Evidence-led PRs/exercise-03-performance-and-a11y-evidence-gate/fixtures/lighthouse-before.json",
  "08 Evidence-led PRs/exercise-03-performance-and-a11y-evidence-gate/fixtures/a11y-before.json",
  "08 Evidence-led PRs/exercise-03-performance-and-a11y-evidence-gate/fixtures/quality-thresholds.json",
  "08 Evidence-led PRs/exercise-03-performance-and-a11y-evidence-gate/docs/gate-cli-contract.md",
  "08 Evidence-led PRs/exercise-03-performance-and-a11y-evidence-gate/docs/evidence-contract.md",
  "08 Evidence-led PRs/exercise-03-performance-and-a11y-evidence-gate/quality-gate-app/scripts/capture-browser-evidence.mjs",
  "08 Evidence-led PRs/exercise-03-performance-and-a11y-evidence-gate/quality-gate-app/scripts/quality-verification.mjs",
  "08 Evidence-led PRs/exercise-03-performance-and-a11y-evidence-gate/quality-gate-app/scripts/test-quality-verifier.mjs",
  "09 Code Review/exercise-01-security-and-a11y-review-gauntlet/review-gauntlet-app/submission-contract.json",
  "09 Code Review/exercise-01-security-and-a11y-review-gauntlet/fixtures/review-expectations.json",
  "09 Code Review/exercise-01-security-and-a11y-review-gauntlet/docs/finding-contract.md",
  "09 Code Review/exercise-01-security-and-a11y-review-gauntlet/review-gauntlet-app/scripts/run-review-component-tests.mjs",
  "09 Code Review/exercise-01-security-and-a11y-review-gauntlet/review-gauntlet-app/scripts/review-verification.mjs",
  "09 Code Review/exercise-01-security-and-a11y-review-gauntlet/review-gauntlet-app/scripts/test-review-verifier.mjs",
  "09 Code Review/exercise-02-diff-triage-with-fresh-agent/fresh-review-app/submission-contract.json",
  "09 Code Review/exercise-02-diff-triage-with-fresh-agent/docs/review-brief.md",
  "09 Code Review/exercise-02-diff-triage-with-fresh-agent/docs/finding-contract.md",
  "09 Code Review/exercise-02-diff-triage-with-fresh-agent/fixtures/review-expectations.json",
  "09 Code Review/exercise-02-diff-triage-with-fresh-agent/fresh-review-app/src/services/workflowApi.acceptance.test.ts",
  "09 Code Review/exercise-02-diff-triage-with-fresh-agent/fresh-review-app/scripts/triage-verification.mjs",
  "09 Code Review/exercise-02-diff-triage-with-fresh-agent/fresh-review-app/scripts/test-triage-verifier.mjs",
  "09 Code Review/exercise-03-review-regression-lab/regression-review-app/submission-contract.json",
  "09 Code Review/exercise-03-review-regression-lab/docs/judgment-contract.md",
  "09 Code Review/exercise-03-review-regression-lab/regression-review-app/scripts/review-eval-verification.mjs",
  "09 Code Review/exercise-03-review-regression-lab/regression-review-app/scripts/score-review-eval.mjs",
  "09 Code Review/exercise-03-review-regression-lab/regression-review-app/scripts/test-review-eval-verifier.mjs",
  "09 Code Review/exercise-03-review-regression-lab/regression-review-app/scripts/verify-review-eval-submission.mjs",
  "10 Token Economics/exercise-01-token-budget-refactor/token-budget-app/scripts/run-context-tests.mjs",
  "10 Token Economics/exercise-01-token-budget-refactor/docs/ledger-contract.md",
  "10 Token Economics/exercise-01-token-budget-refactor/docs/context-sources/AGENTS.md",
  "10 Token Economics/exercise-01-token-budget-refactor/docs/context-sources/current-adapter-contract.md",
  "10 Token Economics/exercise-01-token-budget-refactor/token-budget-app/scripts/context-verification.mjs",
  "10 Token Economics/exercise-01-token-budget-refactor/token-budget-app/scripts/test-context-verifier.mjs",
  "10 Token Economics/exercise-01-token-budget-refactor/token-budget-app/scripts/verify-context-submission.mjs",
  "10 Token Economics/exercise-02-risk-based-model-routing-cost-gate/evals/routing-cases.json",
  "10 Token Economics/exercise-02-risk-based-model-routing-cost-gate/docs/measurement-contract.md",
  "10 Token Economics/exercise-02-risk-based-model-routing-cost-gate/model-routing-app/scripts/routing-verification.mjs",
  "10 Token Economics/exercise-02-risk-based-model-routing-cost-gate/model-routing-app/scripts/score-routing-eval.mjs",
  "10 Token Economics/exercise-02-risk-based-model-routing-cost-gate/model-routing-app/scripts/test-routing-verifier.mjs",
  "10 Token Economics/exercise-02-risk-based-model-routing-cost-gate/model-routing-app/scripts/verify-routing-submission.mjs",
  "10 Token Economics/exercise-03-minimal-diff-scope-budget/minimal-diff-app/scripts/run-migration-tests.mjs",
  "10 Token Economics/exercise-03-minimal-diff-scope-budget/minimal-diff-app/scripts/scope-verification.mjs",
  "10 Token Economics/exercise-03-minimal-diff-scope-budget/minimal-diff-app/scripts/test-scope-verifier.mjs",
  "11 Agentic Refactoring/exercise-01-characterization-test-refactor/docs/renewal-golden-cases.json",
  "11 Agentic Refactoring/exercise-01-characterization-test-refactor/rules-refactor-app/scripts/refactor-verification.mjs",
  "11 Agentic Refactoring/exercise-01-characterization-test-refactor/rules-refactor-app/scripts/test-refactor-verifier.mjs",
  "11 Agentic Refactoring/exercise-01-characterization-test-refactor/rules-refactor-app/scripts/verify-refactor-submission.mjs",
  "11 Agentic Refactoring/exercise-02-strangler-pattern-checkout/docs/checkout-cases.json",
  "11 Agentic Refactoring/exercise-02-strangler-pattern-checkout/checkout-strangler-app/src/checkout/legacyCheckout.mjs",
  "11 Agentic Refactoring/exercise-02-strangler-pattern-checkout/checkout-strangler-app/scripts/strangler-verification.mjs",
  "11 Agentic Refactoring/exercise-02-strangler-pattern-checkout/checkout-strangler-app/scripts/test-strangler-verifier.mjs",
  "11 Agentic Refactoring/exercise-02-strangler-pattern-checkout/checkout-strangler-app/scripts/verify-strangler-submission.mjs",
  "11 Agentic Refactoring/exercise-03-legacy-rules-engine-untangle/docs/contract-observations.json",
  "11 Agentic Refactoring/exercise-03-legacy-rules-engine-untangle/legacy-rules-api/src/test/java/dev/agentic/exercise/workflow/WorkflowApiContractTest.java",
  "11 Agentic Refactoring/exercise-03-legacy-rules-engine-untangle/legacy-rules-app/src/services/workflowDecisionContract.mjs",
  "11 Agentic Refactoring/exercise-03-legacy-rules-engine-untangle/legacy-rules-app/scripts/run-client-contract.mjs",
  "11 Agentic Refactoring/exercise-03-legacy-rules-engine-untangle/legacy-rules-app/scripts/run-rules-contract.mjs",
  "11 Agentic Refactoring/exercise-03-legacy-rules-engine-untangle/legacy-rules-app/scripts/rules-refactor-verification.mjs",
  "11 Agentic Refactoring/exercise-03-legacy-rules-engine-untangle/legacy-rules-app/scripts/test-rules-verifier.mjs",
  "11 Agentic Refactoring/exercise-03-legacy-rules-engine-untangle/legacy-rules-app/scripts/verify-rules-submission.mjs",
  "12 Agentic Retrospective/exercise-01-session-waste-retro-from-logs/docs/session-metadata.json",
  "12 Agentic Retrospective/exercise-01-session-waste-retro-from-logs/docs/metric-contract.md",
  "12 Agentic Retrospective/exercise-01-session-waste-retro-from-logs/docs/replay-contract.md",
  "12 Agentic Retrospective/exercise-01-session-waste-retro-from-logs/docs/preflight-contract.md",
  "12 Agentic Retrospective/exercise-01-session-waste-retro-from-logs/session-waste-app/scripts/retro-verification.mjs",
  "12 Agentic Retrospective/exercise-01-session-waste-retro-from-logs/session-waste-app/scripts/test-retro-verifier.mjs",
  "12 Agentic Retrospective/exercise-01-session-waste-retro-from-logs/session-waste-app/scripts/verify-retro-submission.mjs",
  "12 Agentic Retrospective/exercise-02-rule-hardening-from-repeated-mistakes/docs/correction-history.json",
  "12 Agentic Retrospective/exercise-02-rule-hardening-from-repeated-mistakes/docs/guidance-contract.md",
  "12 Agentic Retrospective/exercise-02-rule-hardening-from-repeated-mistakes/fixtures/filterPersistence.starter.mjs",
  "12 Agentic Retrospective/exercise-02-rule-hardening-from-repeated-mistakes/rule-hardening-app/scripts/rule-hardening-verification.mjs",
  "12 Agentic Retrospective/exercise-02-rule-hardening-from-repeated-mistakes/rule-hardening-app/scripts/test-rule-hardening-verifier.mjs",
  "12 Agentic Retrospective/exercise-02-rule-hardening-from-repeated-mistakes/rule-hardening-app/scripts/verify-rule-hardening-submission.mjs",
  "12 Agentic Retrospective/exercise-03-trace-backed-workflow-optimizer/docs/failure-traces.json",
  "12 Agentic Retrospective/exercise-03-trace-backed-workflow-optimizer/docs/benchmark-contract.md",
  "12 Agentic Retrospective/exercise-03-trace-backed-workflow-optimizer/docs/trace-analysis-contract.md",
  "12 Agentic Retrospective/exercise-03-trace-backed-workflow-optimizer/workflow-optimizer-app/fixtures/workflow-baseline.md",
  "12 Agentic Retrospective/exercise-03-trace-backed-workflow-optimizer/workflow-optimizer-app/scripts/workflow-grading.mjs",
  "12 Agentic Retrospective/exercise-03-trace-backed-workflow-optimizer/workflow-optimizer-app/scripts/workflow-submission-verification.mjs",
  "12 Agentic Retrospective/exercise-03-trace-backed-workflow-optimizer/workflow-optimizer-app/scripts/score-workflow-results.mjs",
  "12 Agentic Retrospective/exercise-03-trace-backed-workflow-optimizer/workflow-optimizer-app/scripts/test-workflow-verifier.mjs",
  "11 Agentic Refactoring/exercise-02-strangler-pattern-checkout/checkout-strangler-app/scripts/run-checkout-tests.mjs",
  "11 Agentic Refactoring/exercise-03-legacy-rules-engine-untangle/legacy-rules-api/src/test/java/dev/agentic/exercise/workflow/WorkflowContractCharacterizationTest.java",
  "12 Agentic Retrospective/exercise-01-session-waste-retro-from-logs/docs/session-events.json",
  "12 Agentic Retrospective/exercise-02-rule-hardening-from-repeated-mistakes/tasks/proving-change.md",
  "12 Agentic Retrospective/exercise-03-trace-backed-workflow-optimizer/workflow-optimizer-app/evals/replay-cases.json",
];
for (const relative of requiredArtifacts) assert.ok(existsSync(path.join(root, relative)), `Missing starter artifact: ${relative}`);

const packageFiles = files.filter((relative) => path.basename(relative) === "package.json");
assert.equal(packageFiles.length, 35, `Expected 35 package.json files, found ${packageFiles.length}`);
for (const relative of packageFiles) {
  const lockfile = path.join(path.dirname(relative), "package-lock.json");
  assert.ok(files.includes(lockfile), `${relative} is missing its committed package-lock.json`);
}
const exercisePackages = packageFiles.filter((relative) => relative !== "package.json");
assert.equal(exercisePackages.length, 34, `Expected 34 exercise packages, found ${exercisePackages.length}`);
for (const relative of exercisePackages) {
  const project = path.dirname(relative);
  for (const artifact of ["lab-contract.json", "challenge-integrity.json"]) {
    assert.ok(files.includes(path.join(project, artifact)), `${relative} is missing ${artifact}`);
  }
  const manifest = JSON.parse(readFileSync(path.join(root, relative), "utf8"));
  assert.ok(manifest.scripts?.["test:integrity"], `${relative} is missing test:integrity`);
  assert.ok(manifest.scripts?.["agent:check"]?.startsWith("npm run test:integrity"), `${relative} must run integrity first`);
  assert.ok(manifest.scripts?.["verify:implementation"], `${relative} is missing verify:implementation`);
  assert.ok(manifest.scripts?.["verify:submission"], `${relative} is missing verify:submission`);
  assert.ok(manifest.scripts?.["verify:exercise"], `${relative} is missing verify:exercise`);
  assert.ok(manifest.scripts["verify:exercise"].includes("agent:check"), `${relative} verify:exercise must run agent:check`);
  assert.ok(manifest.scripts["verify:exercise"].includes("verify:implementation"), `${relative} verify:exercise must run verify:implementation`);
  assert.ok(manifest.scripts["verify:exercise"].includes("verify:submission"), `${relative} verify:exercise must run verify:submission`);
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

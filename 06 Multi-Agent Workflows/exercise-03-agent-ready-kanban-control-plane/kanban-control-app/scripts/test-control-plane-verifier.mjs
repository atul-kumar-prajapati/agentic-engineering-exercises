import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { verifyControlPlaneSubmission } from "./control-plane-verification.mjs";

function git(root, args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function write(root, relative, content) {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return file;
}

function hash(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

const finalBoard = {
  schemaVersion: 1,
  cards: [
    {
      id: "ESC-118", title: "Reproduce schedule order", state: "needs-info", stateHistory: ["incoming", "needs-info"],
      evidence: "No deterministic reproduction is available.", owner: "unassigned", reviewer: "support-platform",
      requestedPaths: ["src/services/workflowApi.ts"], reservedPaths: [], blockedBy: ["REPRO-118"],
      collisionRule: "Do not assign before reproduction.", verificationCommand: "not available",
      acceptanceCriteria: ["Reproduction exists."], mergeCriteria: ["Focused test passes."], dependencies: [], mergeOrder: null,
      rollback: "Close without code.", cancellationReason: null,
    },
    {
      id: "ESC-120", title: "Preserve inherited severity", state: "merged",
      stateHistory: ["incoming", "triaged", "ready-for-agent", "in-progress", "in-review", "merged"],
      evidence: "Child inherits Critical severity.", owner: "severity-agent", reviewer: "risk-owner",
      requestedPaths: ["src/utils/scoring.ts", "src/components/SeverityBadge.tsx", "tests/esc-120/"], reservedPaths: [], blockedBy: [],
      collisionRule: "Exclusive reservation until review.", verificationCommand: "npm run feature:verify",
      acceptanceCriteria: ["Inherited severity renders."], mergeCriteria: ["Focused test passes."], dependencies: [], mergeOrder: 1,
      rollback: "Revert accepted merge.", cancellationReason: null,
    },
    {
      id: "ESC-122", title: "Add due-today boost", state: "blocked",
      stateHistory: ["incoming", "triaged", "ready-for-agent", "blocked"], evidence: "No approved boost exists.",
      owner: "unassigned", reviewer: "risk-owner", requestedPaths: ["src/utils/scoring.ts"], reservedPaths: [],
      blockedBy: ["RULE-ESC-122"], collisionRule: "Wait for an approved rule.", verificationCommand: "not available",
      acceptanceCriteria: ["Rule is approved."], mergeCriteria: ["Focused test passes."], dependencies: ["ESC-120"], mergeOrder: 2,
      rollback: "Cancel without an approved rule.", cancellationReason: null,
    },
    {
      id: "ESC-121", title: "Export large account", state: "cancelled", stateHistory: ["incoming", "ready-for-human", "cancelled"],
      evidence: "Fixture contains production-like data.", owner: "unassigned", reviewer: "security-owner",
      requestedPaths: ["src/services/exportApi.ts"], reservedPaths: [], blockedBy: [],
      collisionRule: "Cancelled work owns no paths.", verificationCommand: "not run",
      acceptanceCriteria: ["Synthetic fixture exists."], mergeCriteria: ["New card required."], dependencies: [], mergeOrder: null,
      rollback: "Delete unmerged work.", cancellationReason: "Production-like personal data is not approved for this exercise.",
    },
  ],
};

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "kanban-control-verifier-"));
try {
  const repositoryRoot = path.join(temporaryRoot, "repo");
  const exerciseRoot = path.join(repositoryRoot, "exercise");
  const appRoot = path.join(exerciseRoot, "kanban-control-app");
  fs.mkdirSync(appRoot, { recursive: true });
  git(repositoryRoot, ["init"]);
  git(repositoryRoot, ["config", "core.autocrlf", "false"]);
  git(repositoryRoot, ["config", "user.name", "Verifier Test"]);
  git(repositoryRoot, ["config", "user.email", "verifier@example.test"]);

  write(appRoot, "src/utils/scoring.ts", "export const severity = 'Low';\n");
  write(appRoot, "src/components/SeverityBadge.tsx", "export const badge = 'Low';\n");
  const seedBoard = { ...finalBoard, cards: finalBoard.cards.map((card) => card.id === "ESC-120" ? { ...card, state: "ready-for-agent", stateHistory: ["incoming", "triaged", "ready-for-agent"], reservedPaths: card.requestedPaths } : card) };
  const seedJson = `${JSON.stringify(seedBoard, null, 2)}\n`;
  write(exerciseRoot, "docs/agent-board.json", seedJson);
  write(appRoot, "src/data/agent-board.json", seedJson);
  write(exerciseRoot, "docs/agent-board.md", "# seed board\n");
  write(exerciseRoot, "docs/ownership-map.md", "# seed ownership\n");
  write(exerciseRoot, "docs/integration-log.md", "# seed integration\n");
  git(repositoryRoot, ["add", "."]);
  git(repositoryRoot, ["commit", "-m", "test: create kanban baseline"]);
  const baseSha = git(repositoryRoot, ["rev-parse", "HEAD"]);

  git(repositoryRoot, ["switch", "-c", "lane/esc-120-inherited-severity", baseSha]);
  write(appRoot, "src/utils/scoring.ts", "export const severity = 'Critical';\n");
  write(appRoot, "src/components/SeverityBadge.tsx", "export const badge = 'Critical';\n");
  write(appRoot, "tests/esc-120/inherited.test.ts", "// regression test\n");
  git(repositoryRoot, ["add", "."]);
  git(repositoryRoot, ["commit", "-m", "esc-120: preserve inherited severity", "-m", `Card: ESC-120\nBase-SHA: ${baseSha}`]);
  const laneSha = git(repositoryRoot, ["rev-parse", "HEAD"]);

  git(repositoryRoot, ["switch", "-c", "integration/kanban-control", baseSha]);
  git(repositoryRoot, ["merge", "--no-ff", "lane/esc-120-inherited-severity", "-m", "merge: accept ESC-120"]);
  const mergeSha = git(repositoryRoot, ["rev-parse", "HEAD"]);
  const finalJson = `${JSON.stringify(finalBoard, null, 2)}\n`;
  write(exerciseRoot, "docs/agent-board.json", finalJson);
  write(appRoot, "src/data/agent-board.json", finalJson);
  write(exerciseRoot, "docs/agent-board.md", "# Final board\n\nESC-118 needs-info. ESC-120 merged. ESC-121 cancelled. ESC-122 blocked. There are no active reservations.\n");
  write(exerciseRoot, "docs/ownership-map.md", "# Ownership\n\nESC-118, ESC-120, ESC-121, and ESC-122 have no active reservations. ESC-122 remains blocked by RULE-ESC-122.\n");
  write(exerciseRoot, "docs/integration-log.md", `# Integration\n\nBase SHA: ${baseSha}. Lane commit: ${laneSha}. Reviewer risk-owner accepted it after the feature command passed. Merge commit: ${mergeSha}. The board command passed. Decision: accept. Rollback reverts the merge.\n`);
  git(repositoryRoot, ["add", "."]);
  git(repositoryRoot, ["commit", "-m", "control: synchronize final kanban state"]);
  const controlSha = git(repositoryRoot, ["rev-parse", "HEAD"]);

  const featureOutput = write(exerciseRoot, "evidence/commands/esc-120.txt", `Reviewed SHA: ${laneSha}\nCard: ESC-120\nPASS: inherited severity focused suite completed with two passing assertions and exit code zero.\n`);
  const boardOutput = write(exerciseRoot, "evidence/commands/board.txt", `Reviewed SHA: ${controlSha}\nPASS: board mirrors, card histories, blockers, reservation releases, ownership, and integration records are consistent.\n`);
  const review = write(exerciseRoot, "evidence/completed-lane.md", `# Completed lane\n\nBase SHA: ${baseSha}\n\nLane commit: ${laneSha}\n\nOwned paths and changed paths were compared with Git. The feature command passed. Reviewer decision: risk-owner accepted the exact commit. Merge commit: ${mergeSha}. Rollback: git revert ${mergeSha}. Remaining risk: ESC-122 awaits its rule.\n`);
  const evidence = {
    schema_version: 1,
    base_sha: baseSha,
    lane: {
      card_id: "ESC-120", agent: "severity-agent-session", branch: "lane/esc-120-inherited-severity", base_sha: baseSha,
      commit_sha: laneSha, owned_paths: ["src/utils/scoring.ts", "src/components/SeverityBadge.tsx", "tests/esc-120/"],
      changed_paths: ["src/components/SeverityBadge.tsx", "src/utils/scoring.ts", "tests/esc-120/inherited.test.ts"],
      verification: { command: "npm run feature:verify", exit_code: 0, output_path: "evidence/commands/esc-120.txt", output_sha256: hash(featureOutput) },
      reviewer: "risk-owner", review_decision: "accept", review_path: "evidence/completed-lane.md", review_sha256: hash(review),
      rollback: `git revert ${mergeSha}`,
    },
    integration: {
      branch: "integration/kanban-control", merge_commit_sha: mergeSha, control_commit_sha: controlSha, decision: "accept",
      board_verification: { command: "npm run board:verify", exit_code: 0, output_path: "evidence/commands/board.txt", output_sha256: hash(boardOutput) },
    },
  };
  write(exerciseRoot, "evidence/control-plane.json", `${JSON.stringify(evidence, null, 2)}\n`);
  git(repositoryRoot, ["add", "."]);
  git(repositoryRoot, ["commit", "-m", "evidence: record kanban integration"]);

  assert.deepEqual(verifyControlPlaneSubmission({ repositoryRoot, appRoot, exerciseRoot }), []);
  evidence.lane.changed_paths.push("src/App.tsx");
  write(exerciseRoot, "evidence/control-plane.json", JSON.stringify(evidence));
  assert.ok(verifyControlPlaneSubmission({ repositoryRoot, appRoot, exerciseRoot }).some((failure) => failure.includes("changed_paths do not match Git")));
  console.log("kanban control-plane verifier self-test passed");
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}

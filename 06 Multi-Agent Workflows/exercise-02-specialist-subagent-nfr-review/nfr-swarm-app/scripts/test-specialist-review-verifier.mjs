import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { verifySpecialistSubmission } from "./specialist-review-verification.mjs";

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

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "specialist-verifier-"));
try {
  const repositoryRoot = path.join(temporaryRoot, "repo");
  const exerciseRoot = path.join(repositoryRoot, "exercise");
  const appRoot = path.join(exerciseRoot, "nfr-swarm-app");
  fs.mkdirSync(appRoot, { recursive: true });
  git(repositoryRoot, ["init"]);
  git(repositoryRoot, ["config", "core.autocrlf", "false"]);
  git(repositoryRoot, ["config", "user.name", "Verifier Test"]);
  git(repositoryRoot, ["config", "user.email", "verifier@example.test"]);

  const requiredSources = [
    "src/App.tsx",
    "src/components/AccessReviewQueue.tsx",
    "src/components/ReviewNote.tsx",
    "src/services/accessReviewApi.ts",
    "src/utils/accessReviewRisk.ts",
  ];
  for (const file of requiredSources) write(appRoot, file, `// seeded risk\nexport const baseline = "${file}";\n`);
  git(repositoryRoot, ["add", "."]);
  git(repositoryRoot, ["commit", "-m", "test: create specialist baseline"]);
  const baselineSha = git(repositoryRoot, ["rev-parse", "HEAD"]);

  for (const file of requiredSources) write(appRoot, file, `// remediated\nexport const fixed = "${file}";\n`);
  git(repositoryRoot, ["add", "."]);
  git(repositoryRoot, ["commit", "-m", "fix: remediate specialist findings"]);
  const remediationSha = git(repositoryRoot, ["rev-parse", "HEAD"]);

  const definitions = {
    security: [
      ["SEC-01", "nfr-swarm-app/src/components/ReviewNote.tsx"],
      ["SEC-02", "nfr-swarm-app/src/services/accessReviewApi.ts"],
    ],
    accessibility: [["A11Y-01", "nfr-swarm-app/src/components/AccessReviewQueue.tsx"]],
    performance: [["PERF-01", "nfr-swarm-app/src/utils/accessReviewRisk.ts"]],
    testability: [["TEST-01", "nfr-swarm-app/src/services/accessReviewApi.ts"]],
  };
  const commands = {
    security: "npm run review:security",
    accessibility: "npm run review:accessibility",
    performance: "npm run review:performance",
    testability: "npm run review:testability",
  };
  const specialists = [];
  const decisions = [];
  for (const [specialist, required] of Object.entries(definitions)) {
    const beforeReport = write(exerciseRoot, `evidence/specialists/${specialist}-before.md`, `# ${specialist} before report\n\nReviewed commit SHA: ${baselineSha}\n\nFindings: ${required.map(([id]) => id).join(", ")}. Reproduction, severity, file, impact, and recommendation were recorded with sufficient detail for integration review.\n`);
    const afterReport = write(exerciseRoot, `evidence/specialists/${specialist}-after.md`, `# ${specialist} after report\n\nReviewed commit SHA: ${remediationSha}\n\nPASS. Every earlier finding was rechecked using the focused command and the remediation now satisfies the protected specialist gate.\n`);
    const beforeOutput = write(exerciseRoot, `evidence/commands/${specialist}-before.txt`, `FAIL ${specialist} protected review at ${baselineSha}. The focused suite found the seeded blocker and returned a non-zero result. Full diagnostic evidence is retained here.\n`);
    const afterOutput = write(exerciseRoot, `evidence/commands/${specialist}-after.txt`, `PASS ${specialist} protected review at ${remediationSha}. The focused suite completed every assertion successfully with exit code zero. Full result retained.\n`);
    const findings = required.map(([id, findingPath]) => ({
      id,
      severity: "blocker",
      path: findingPath,
      line: 1,
      reproduction: "Executed the protected focused review against the baseline source.",
      impact: "The critical access approval workflow is unsafe or cannot be completed reliably.",
      recommendation: "Apply the smallest boundary fix and rerun the protected specialist check.",
    }));
    specialists.push({
      specialist,
      before: {
        agent: `before-${specialist}-agent`,
        session_id: `before-${specialist}-session`,
        reviewed_sha: baselineSha,
        report_path: `evidence/specialists/${specialist}-before.md`,
        report_sha256: hash(beforeReport),
        command: commands[specialist],
        exit_code: 1,
        output_path: `evidence/commands/${specialist}-before.txt`,
        output_sha256: hash(beforeOutput),
        findings,
      },
      after: {
        agent: `after-${specialist}-agent`,
        session_id: `after-${specialist}-session`,
        reviewed_sha: remediationSha,
        report_path: `evidence/specialists/${specialist}-after.md`,
        report_sha256: hash(afterReport),
        command: commands[specialist],
        exit_code: 0,
        output_path: `evidence/commands/${specialist}-after.txt`,
        output_sha256: hash(afterOutput),
        result: "pass",
      },
    });
    for (const finding of findings) decisions.push({
      finding_id: finding.id,
      decision: "fix",
      owner: "integration owner",
      rationale: "The protected blocker affects the critical approval workflow.",
      verification: `${commands[specialist]} passed at the remediation SHA.`,
      residual_risk: "No known residual risk remains after the focused recheck.",
    });
  }

  const performanceBefore = write(exerciseRoot, "evidence/performance-before.json", `${JSON.stringify({ sourceSha: baselineSha, scenario: "portfolio-risk", sampleSize: 200, iterations: 5, durationMs: 100, result: 41 }, null, 2)}\n`);
  const performanceAfter = write(exerciseRoot, "evidence/performance-after.json", `${JSON.stringify({ sourceSha: remediationSha, scenario: "portfolio-risk", sampleSize: 200, iterations: 5, durationMs: 10, result: 41 }, null, 2)}\n`);
  write(exerciseRoot, "evidence/review-cycle.json", `${JSON.stringify({
    schema_version: 1,
    baseline_sha: baselineSha,
    remediation_sha: remediationSha,
    performance: {
      before_path: "evidence/performance-before.json",
      before_sha256: hash(performanceBefore),
      after_path: "evidence/performance-after.json",
      after_sha256: hash(performanceAfter),
    },
    specialists,
  }, null, 2)}\n`);
  write(exerciseRoot, "evidence/decision-log.json", `${JSON.stringify({
    schema_version: 1,
    baseline_sha: baselineSha,
    remediation_sha: remediationSha,
    merge_decision: "approve",
    rollback: `git revert ${remediationSha}`,
    changed_paths: requiredSources,
    decisions,
  }, null, 2)}\n`);
  write(exerciseRoot, "evidence/integration.md", `# Integration\n\nBaseline SHA: ${baselineSha}\n\nRemediation SHA: ${remediationSha}\n\nSpecialist reports received complete triage. Changed paths were limited to source. Final checks passed. Merge decision: approve. Rollback uses the remediation commit. Remaining risk: none.\n`);
  git(repositoryRoot, ["add", "."]);
  git(repositoryRoot, ["commit", "-m", "evidence: record specialist review cycle"]);

  assert.deepEqual(verifySpecialistSubmission({ repositoryRoot, appRoot, exerciseRoot }), []);
  const cyclePath = path.join(exerciseRoot, "evidence", "review-cycle.json");
  const tampered = JSON.parse(fs.readFileSync(cyclePath, "utf8"));
  tampered.specialists[0].after.session_id = tampered.specialists[0].before.session_id;
  fs.writeFileSync(cyclePath, JSON.stringify(tampered));
  assert.ok(verifySpecialistSubmission({ repositoryRoot, appRoot, exerciseRoot }).some((failure) => failure.includes("distinct session IDs")));
  console.log("specialist review verifier self-test passed");
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}

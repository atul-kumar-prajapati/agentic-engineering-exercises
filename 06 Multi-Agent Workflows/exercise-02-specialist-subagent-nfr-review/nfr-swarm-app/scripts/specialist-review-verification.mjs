import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const RULES = {
  security: {
    command: "npm run review:security",
    required: {
      "SEC-01": "nfr-swarm-app/src/components/ReviewNote.tsx",
      "SEC-02": "nfr-swarm-app/src/services/accessReviewApi.ts",
    },
  },
  accessibility: {
    command: "npm run review:accessibility",
    required: { "A11Y-01": "nfr-swarm-app/src/components/AccessReviewQueue.tsx" },
  },
  performance: {
    command: "npm run review:performance",
    required: { "PERF-01": "nfr-swarm-app/src/utils/accessReviewRisk.ts" },
  },
  testability: {
    command: "npm run review:testability",
    required: { "TEST-01": "nfr-swarm-app/src/services/accessReviewApi.ts" },
  },
};

const REQUIRED_CHANGED_PATHS = [
  "src/App.tsx",
  "src/components/AccessReviewQueue.tsx",
  "src/components/ReviewNote.tsx",
  "src/services/accessReviewApi.ts",
  "src/utils/accessReviewRisk.ts",
];

const SUPPLIED_FINDING_ID = "CLAIM-01";

function git(root, args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function hashFile(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function isSha(value) {
  return /^[a-f0-9]{40}$/i.test(value ?? "");
}

function readJson(file, failures, label) {
  if (!fs.existsSync(file)) {
    failures.push(`missing ${label}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    failures.push(`${label} is invalid JSON`);
    return null;
  }
}

function resolveInside(root, relative, failures, label) {
  if (typeof relative !== "string" || !relative.trim()) {
    failures.push(`${label} path is missing`);
    return null;
  }
  const absolute = path.resolve(root, relative);
  if (absolute !== root && !absolute.startsWith(`${root}${path.sep}`)) {
    failures.push(`${label} escapes the exercise directory`);
    return null;
  }
  return absolute;
}

function verifyArtifact(exerciseRoot, record, expected, phase, failures) {
  const label = `${expected.specialist} ${phase}`;
  if (!record || typeof record !== "object") {
    failures.push(`${label} record is missing`);
    return;
  }
  if (typeof record.agent !== "string" || record.agent.trim().length < 3) failures.push(`${label} agent is missing`);
  if (typeof record.session_id !== "string" || record.session_id.trim().length < 5) failures.push(`${label} session_id is missing`);
  if (record.reviewed_sha !== expected.sha) failures.push(`${label} reviewed a different SHA`);
  if (record.command !== expected.command) failures.push(`${label} command must be ${expected.command}`);
  const expectedReport = `evidence/specialists/${expected.specialist}-${phase}.md`;
  const expectedOutput = `evidence/commands/${expected.specialist}-${phase}.txt`;
  if (record.report_path !== expectedReport) failures.push(`${label} report_path must be ${expectedReport}`);
  if (record.output_path !== expectedOutput) failures.push(`${label} output_path must be ${expectedOutput}`);
  if (record.exit_code !== (phase === "before" ? 1 : 0)) failures.push(`${label} exit_code is invalid`);

  for (const [kind, relative, claimedHash] of [
    ["report", record.report_path, record.report_sha256],
    ["output", record.output_path, record.output_sha256],
  ]) {
    const artifact = resolveInside(exerciseRoot, relative, failures, `${label} ${kind}`);
    if (!artifact || !fs.existsSync(artifact)) failures.push(`missing ${relative ?? `${label} ${kind}`}`);
    else {
      if (!/^[a-f0-9]{64}$/.test(claimedHash ?? "") || hashFile(artifact) !== claimedHash) failures.push(`${label} ${kind} hash does not match`);
      const text = fs.readFileSync(artifact, "utf8");
      if (text.length < 120) failures.push(`${label} ${kind} is too short`);
      if (kind === "report" && !text.includes(expected.sha)) failures.push(`${label} report does not name the reviewed SHA`);
      if (kind === "output" && !text.includes(expected.sha)) failures.push(`${label} output does not name the reviewed SHA`);
      if (kind === "output" && !(phase === "before" ? /fail/i.test(text) : /pass/i.test(text))) failures.push(`${label} output does not show the expected ${phase === "before" ? "failure" : "pass"}`);
    }
  }
  if (phase === "after" && record.result !== "pass") failures.push(`${label} result must be pass`);
}

function sourceLineCount(repositoryRoot, sha, exercisePrefix, finding, failures) {
  if (typeof finding.path !== "string" || !finding.path.startsWith("nfr-swarm-app/src/")) {
    failures.push(`${finding.id ?? "finding"} must reference a source path inside nfr-swarm-app`);
    return 0;
  }
  try {
    return git(repositoryRoot, ["show", `${sha}:${exercisePrefix}${finding.path}`]).split(/\r?\n/).length;
  } catch {
    failures.push(`${finding.id} path does not exist at the baseline SHA`);
    return 0;
  }
}

function verifyFinding(repositoryRoot, exercisePrefix, baselineSha, finding, expectedPath, failures) {
  const label = finding?.id ?? "finding without ID";
  if (!finding || typeof finding !== "object") {
    failures.push("invalid finding record");
    return;
  }
  if (expectedPath && finding.path !== expectedPath) failures.push(`${label} must reference ${expectedPath}`);
  if (!/^[A-Z0-9]+-[0-9]{2}$/.test(finding.id ?? "")) failures.push(`${label} has an invalid ID`);
  if (!['blocker', 'warning'].includes(finding.severity)) failures.push(`${label} severity must be blocker or warning`);
  const lines = sourceLineCount(repositoryRoot, baselineSha, exercisePrefix, finding, failures);
  if (!Number.isInteger(finding.line) || finding.line < 1 || finding.line > lines) failures.push(`${label} line is outside the baseline file`);
  for (const field of ["reproduction", "impact", "recommendation"]) {
    if (typeof finding[field] !== "string" || finding[field].trim().length < 15) failures.push(`${label} ${field} needs concrete detail`);
  }
}

function verifyPerformance(exerciseRoot, baselineSha, remediationSha, record, failures) {
  const expected = {
    before_path: "evidence/performance-before.json",
    after_path: "evidence/performance-after.json",
  };
  for (const phase of ["before", "after"]) {
    const pathField = `${phase}_path`;
    const hashField = `${phase}_sha256`;
    if (record?.[pathField] !== expected[pathField]) failures.push(`performance ${pathField} must be ${expected[pathField]}`);
    const file = resolveInside(exerciseRoot, record?.[pathField], failures, `performance ${phase}`);
    if (!file || !fs.existsSync(file)) failures.push(`missing performance ${phase} evidence`);
    else if (!/^[a-f0-9]{64}$/.test(record?.[hashField] ?? "") || hashFile(file) !== record[hashField]) failures.push(`performance ${phase} hash does not match`);
  }
  const before = readJson(path.join(exerciseRoot, expected.before_path), failures, "evidence/performance-before.json");
  const after = readJson(path.join(exerciseRoot, expected.after_path), failures, "evidence/performance-after.json");
  if (!before || !after) return;
  if (before.sourceSha !== baselineSha) failures.push("performance-before sourceSha must equal baseline_sha");
  if (after.sourceSha !== remediationSha) failures.push("performance-after sourceSha must equal remediation_sha");
  for (const field of ["scenario", "sampleSize", "iterations", "result"]) if (before[field] !== after[field]) failures.push(`performance ${field} must be identical before and after`);
  if (before.scenario !== "portfolio-risk" || before.sampleSize !== 200 || before.iterations !== 5 || before.result !== 41) failures.push("performance measurement does not use the protected scenario");
  if (!(before.durationMs > 0) || !(after.durationMs > 0)) failures.push("performance durations must be positive");
  else if (after.durationMs > before.durationMs * 0.25) failures.push("remediation must reduce protected benchmark duration by at least 75 percent");
}

export function verifySpecialistSubmission({ repositoryRoot, appRoot, exerciseRoot }) {
  const failures = [];
  const evidenceRoot = path.join(exerciseRoot, "evidence");
  const cycle = readJson(path.join(evidenceRoot, "review-cycle.json"), failures, "evidence/review-cycle.json");
  const decisions = readJson(path.join(evidenceRoot, "decision-log.json"), failures, "evidence/decision-log.json");
  if (!cycle || !decisions) return failures;
  if (cycle.schema_version !== 1) failures.push("review-cycle.json schema_version must be 1");
  const baselineSha = cycle.baseline_sha;
  const remediationSha = cycle.remediation_sha;
  if (!isSha(baselineSha)) failures.push("baseline_sha is invalid");
  if (!isSha(remediationSha)) failures.push("remediation_sha is invalid");

  const exercisePrefix = `${path.relative(repositoryRoot, exerciseRoot).replaceAll("\\", "/")}/`;
  const appPrefix = `${path.relative(repositoryRoot, appRoot).replaceAll("\\", "/")}/`;
  if (isSha(baselineSha) && isSha(remediationSha)) {
    try {
      git(repositoryRoot, ["merge-base", "--is-ancestor", baselineSha, remediationSha]);
      const repositoryPaths = git(repositoryRoot, ["diff", "--name-only", baselineSha, remediationSha]).split(/\r?\n/).filter(Boolean).map((item) => item.replaceAll("\\", "/"));
      const appPaths = repositoryPaths.map((item) => item.startsWith(appPrefix) ? item.slice(appPrefix.length) : null);
      for (const item of repositoryPaths) if (!item.startsWith(`${appPrefix}src/`) && !item.startsWith(`${appPrefix}tests/`)) failures.push(`remediation changed forbidden path ${item}`);
      for (const required of REQUIRED_CHANGED_PATHS) if (!appPaths.includes(required)) failures.push(`remediation must change ${required}`);
      const head = git(repositoryRoot, ["rev-parse", "HEAD"]);
      git(repositoryRoot, ["merge-base", "--is-ancestor", remediationSha, head]);
      const laterCommits = git(repositoryRoot, ["rev-list", "--first-parent", `${remediationSha}..${head}`]).split(/\r?\n/).filter(Boolean);
      for (const commit of laterCommits) {
        const parent = git(repositoryRoot, ["rev-list", "--parents", "-n", "1", commit]).split(/\s+/)[1];
        const paths = git(repositoryRoot, ["diff", "--name-only", parent, commit]).split(/\r?\n/).filter(Boolean).map((item) => item.replaceAll("\\", "/"));
        for (const item of paths) if (!item.startsWith(`${exercisePrefix}evidence/`)) failures.push(`commit after remediation_sha changes non-evidence path ${item}`);
      }
      if (Array.isArray(decisions.changed_paths)) {
        const actual = appPaths.filter(Boolean).sort();
        const declared = [...decisions.changed_paths].sort();
        if (JSON.stringify(actual) !== JSON.stringify(declared)) failures.push("decision-log changed_paths do not match Git");
      } else failures.push("decision-log changed_paths must be an array");
    } catch (error) {
      failures.push(`Git remediation verification failed: ${error.message}`);
    }
  }

  const specialists = cycle.specialists;
  if (!Array.isArray(specialists) || specialists.length !== 4) failures.push("review-cycle.json must contain exactly four specialists");
  const allFindings = [];
  const sessionIds = [];
  if (Array.isArray(specialists)) {
    const roles = specialists.map((item) => item.specialist).sort();
    if (JSON.stringify(roles) !== JSON.stringify(Object.keys(RULES).sort())) failures.push("review cycle must contain security, accessibility, performance, and testability once each");
    for (const specialist of specialists) {
      const rule = RULES[specialist.specialist];
      if (!rule) continue;
      verifyArtifact(exerciseRoot, specialist.before, { specialist: specialist.specialist, sha: baselineSha, command: rule.command }, "before", failures);
      verifyArtifact(exerciseRoot, specialist.after, { specialist: specialist.specialist, sha: remediationSha, command: rule.command }, "after", failures);
      sessionIds.push(specialist.before?.session_id, specialist.after?.session_id);
      if (!Array.isArray(specialist.before?.findings)) failures.push(`${specialist.specialist} before findings must be an array`);
      else {
        const byId = new Map(specialist.before.findings.map((finding) => [finding.id, finding]));
        for (const [id, expectedPath] of Object.entries(rule.required)) {
          if (!byId.has(id)) failures.push(`${specialist.specialist} report is missing ${id}`);
          else if (byId.get(id).severity !== "blocker") failures.push(`${id} must be a blocker`);
        }
        for (const finding of specialist.before.findings) {
          verifyFinding(repositoryRoot, exercisePrefix, baselineSha, finding, rule.required[finding.id], failures);
          allFindings.push(finding);
        }
      }
    }
  }
  if (sessionIds.some((item) => typeof item !== "string") || new Set(sessionIds).size !== 8) failures.push("all before and after reviews must use distinct session IDs");
  const findingIds = allFindings.map((item) => item.id);
  if (new Set(findingIds).size !== findingIds.length) failures.push("finding IDs must be unique across specialist reports");

  if (decisions.schema_version !== 1) failures.push("decision-log.json schema_version must be 1");
  if (decisions.baseline_sha !== baselineSha || decisions.remediation_sha !== remediationSha) failures.push("decision-log SHAs must match review-cycle.json");
  if (decisions.merge_decision !== "approve") failures.push("merge_decision must be approve after all gates pass");
  if (typeof decisions.rollback !== "string" || !decisions.rollback.includes(remediationSha)) failures.push("rollback must target remediation_sha");
  if (!Array.isArray(decisions.decisions)) failures.push("decision-log decisions must be an array");
  else {
    const decisionIds = decisions.decisions.map((item) => item.finding_id);
    const requiredDecisionIds = [...findingIds, SUPPLIED_FINDING_ID].sort();
    if (JSON.stringify([...decisionIds].sort()) !== JSON.stringify(requiredDecisionIds)) failures.push("decision-log must triage every baseline finding and CLAIM-01 exactly once");
    for (const decision of decisions.decisions) {
      if (!["fix", "defer", "dismiss"].includes(decision.decision)) failures.push(`${decision.finding_id} has an invalid decision`);
      if (Object.values(RULES).some((rule) => Object.hasOwn(rule.required, decision.finding_id)) && decision.decision !== "fix") failures.push(`${decision.finding_id} is a required blocker and must be fixed`);
      for (const field of ["owner", "rationale", "verification", "residual_risk"]) if (typeof decision[field] !== "string" || decision[field].trim().length < 8) failures.push(`${decision.finding_id} ${field} is incomplete`);
    }
    const suppliedDecision = decisions.decisions.find((item) => item.finding_id === SUPPLIED_FINDING_ID);
    if (suppliedDecision?.decision !== "dismiss") failures.push("CLAIM-01 must be dismissed after source-backed review");
    if (typeof suppliedDecision?.verification !== "string" || !/service|boundary|actor/i.test(suppliedDecision.verification)) failures.push("CLAIM-01 dismissal must cite service-boundary or actor evidence");
  }

  if (!Array.isArray(decisions.interactions) || decisions.interactions.length !== 1) failures.push("decision-log must contain one cross-specialist interaction");
  else {
    const interaction = decisions.interactions[0];
    if (JSON.stringify([...(interaction.finding_ids ?? [])].sort()) !== JSON.stringify(["SEC-02", "TEST-01"])) failures.push("interaction must connect SEC-02 and TEST-01");
    if (interaction.shared_path !== "src/services/accessReviewApi.ts") failures.push("SEC-02 and TEST-01 interaction must name their shared service path");
    if (!Array.isArray(interaction.verification_commands) || !["npm run review:security", "npm run review:testability"].every((command) => interaction.verification_commands.includes(command))) failures.push("interaction must include both security and testability verification commands");
    for (const field of ["resolution", "residual_risk"]) if (typeof interaction[field] !== "string" || interaction[field].trim().length < 15) failures.push(`interaction ${field} needs concrete detail`);
  }

  verifyPerformance(exerciseRoot, baselineSha, remediationSha, cycle.performance, failures);
  const integrationReport = path.join(evidenceRoot, "integration.md");
  if (!fs.existsSync(integrationReport)) failures.push("missing evidence/integration.md");
  else {
    const text = fs.readFileSync(integrationReport, "utf8").toLowerCase();
    for (const term of ["baseline sha", "remediation sha", "specialist", "triage", "changed paths", "final checks", "merge decision", "rollback", "remaining risk"]) if (!text.includes(term)) failures.push(`integration.md is missing ${term}`);
  }
  return [...new Set(failures)];
}

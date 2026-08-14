import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const LANE_RULES = {
  A: {
    branch: "lane/saved-filters",
    subject: "lane-a:",
    command: "npm run test:lane-a",
    output: "evidence/commands/lane-a.txt",
    ownedPaths: ["src/components/FilterBar.tsx", "src/utils/filters.ts", "tests/lane-a/"],
    requiredFiles: ["src/components/FilterBar.tsx", "src/utils/filters.ts"],
    testPrefix: "tests/lane-a/",
    sharedSymbol: "FilterPreset",
  },
  B: {
    branch: "lane/sla-risk",
    subject: "lane-b:",
    command: "npm run test:lane-b",
    output: "evidence/commands/lane-b.txt",
    ownedPaths: ["src/components/MetricStrip.tsx", "src/utils/scoring.ts", "tests/lane-b/"],
    requiredFiles: ["src/components/MetricStrip.tsx", "src/utils/scoring.ts"],
    testPrefix: "tests/lane-b/",
    sharedSymbol: null,
  },
  C: {
    branch: "lane/evidence-export",
    subject: "lane-c:",
    command: "npm run test:lane-c",
    output: "evidence/commands/lane-c.txt",
    ownedPaths: ["src/components/EvidencePanel.tsx", "src/services/workflowApi.ts", "tests/lane-c/"],
    requiredFiles: ["src/components/EvidencePanel.tsx", "src/services/workflowApi.ts"],
    testPrefix: "tests/lane-c/",
    sharedSymbol: "EvidenceBundle",
  },
};

function git(repositoryRoot, args, options = {}) {
  return execFileSync("git", args, { cwd: repositoryRoot, encoding: "utf8", ...options }).trim();
}

function isSha(value) {
  return /^[a-f0-9]{40}$/i.test(value ?? "");
}

function hashFile(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
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
  const absolute = path.resolve(root, relative);
  const rootWithSeparator = root.endsWith(path.sep) ? root : `${root}${path.sep}`;
  if (absolute !== root && !absolute.startsWith(rootWithSeparator)) {
    failures.push(`${label} escapes the exercise root`);
    return null;
  }
  return absolute;
}

function commitParents(repositoryRoot, commit) {
  return git(repositoryRoot, ["rev-list", "--parents", "-n", "1", commit]).split(/\s+/).slice(1);
}

function changedRepositoryPaths(repositoryRoot, from, to) {
  return git(repositoryRoot, ["diff", "--name-only", "--diff-filter=ACMR", from, to]).split(/\r?\n/).filter(Boolean).map((item) => item.replaceAll("\\", "/"));
}

function toAppPaths(repositoryPaths, appPrefix, failures, label) {
  return repositoryPaths.map((item) => {
    if (!item.startsWith(appPrefix)) {
      failures.push(`${label} changed path outside worktree-feature-app: ${item}`);
      return null;
    }
    return item.slice(appPrefix.length);
  }).filter(Boolean).sort();
}

function equalArrays(left, right) {
  return left.length === right.length && left.every((item, index) => item === right[index]);
}

function pathAllowed(candidate, allowed) {
  return allowed.some((entry) => entry.endsWith("/") ? candidate.startsWith(entry) : candidate === entry);
}

function parseWorktreeList(source) {
  return source.replaceAll("\r\n", "\n").trim().split(/\n\n+/).map((record) => {
    const result = {};
    for (const line of record.split("\n")) {
      const space = line.indexOf(" ");
      if (space === -1) result[line] = true;
      else result[line.slice(0, space)] = line.slice(space + 1);
    }
    return result;
  });
}

function verifyOutput(exerciseRoot, verification, rule, failures, label) {
  if (!verification || typeof verification !== "object") {
    failures.push(`${label} verification is missing`);
    return;
  }
  if (verification.command !== rule.command) failures.push(`${label} command must be ${rule.command}`);
  if (verification.exit_code !== 0) failures.push(`${label} command must exit 0`);
  if (verification.output_path !== rule.output) failures.push(`${label} output_path must be ${rule.output}`);
  if (!/^[a-f0-9]{64}$/.test(verification.output_sha256 ?? "")) failures.push(`${label} output_sha256 must be a lowercase SHA-256`);
  const output = resolveInside(exerciseRoot, verification.output_path ?? "", failures, `${label} output`);
  if (!output || !fs.existsSync(output)) failures.push(`missing ${verification.output_path ?? `${label} output`}`);
  else {
    if (hashFile(output) !== verification.output_sha256) failures.push(`${label} output hash does not match the captured file`);
    const text = fs.readFileSync(output, "utf8");
    if (text.length < 80 || !/pass/i.test(text)) failures.push(`${label} output does not contain a complete passing test result`);
  }
}

function blobId(repositoryRoot, commit, repositoryPath) {
  try {
    return git(repositoryRoot, ["rev-parse", `${commit}:${repositoryPath}`]);
  } catch {
    return null;
  }
}

function verifyLane(repositoryRoot, appPrefix, exerciseRoot, baseSha, handoff, worktrees, failures) {
  const lane = handoff?.lane;
  const rule = LANE_RULES[lane];
  if (!rule) {
    failures.push(`unknown lane ${lane ?? "without ID"}`);
    return;
  }
  const label = `Lane ${lane}`;
  if (handoff.status !== "ready") failures.push(`${label} status must be ready`);
  if (typeof handoff.agent !== "string" || handoff.agent.trim().length < 3) failures.push(`${label} needs an agent and session identifier`);
  if (handoff.branch !== rule.branch) failures.push(`${label} branch must be ${rule.branch}`);
  if (handoff.base_sha !== baseSha) failures.push(`${label} base SHA differs from the submission base`);
  if (!isSha(handoff.commit_sha)) failures.push(`${label} commit SHA is invalid`);
  if (!path.isAbsolute(handoff.worktree_path ?? "")) failures.push(`${label} worktree_path must be absolute`);
  if (!equalArrays(handoff.owned_paths ?? [], rule.ownedPaths)) failures.push(`${label} owned_paths do not match the protected ownership map`);
  if (typeof handoff.risks !== "string" || !handoff.risks.trim()) failures.push(`${label} must record remaining risks or none`);

  const matchingWorktree = worktrees.find((item) => item.branch === `refs/heads/${rule.branch}`);
  if (!matchingWorktree) failures.push(`${label} is absent from worktree-list-before.txt`);
  else {
    if (path.resolve(matchingWorktree.worktree) !== path.resolve(handoff.worktree_path)) failures.push(`${label} worktree path differs from the captured worktree list`);
    if (matchingWorktree.HEAD !== handoff.commit_sha) failures.push(`${label} worktree capture is not at the handed-off commit`);
  }

  if (isSha(handoff.commit_sha)) {
    try {
      git(repositoryRoot, ["cat-file", "-e", `${handoff.commit_sha}^{commit}`]);
      const parents = commitParents(repositoryRoot, handoff.commit_sha);
      if (parents.length !== 1 || parents[0] !== baseSha) failures.push(`${label} commit must have the common base as its only parent`);
      const branchHead = git(repositoryRoot, ["rev-parse", `refs/heads/${rule.branch}`]);
      if (branchHead !== handoff.commit_sha) failures.push(`${label} branch no longer points to its handed-off commit`);
      const message = git(repositoryRoot, ["show", "-s", "--format=%B", handoff.commit_sha]);
      if (!message.toLowerCase().startsWith(rule.subject)) failures.push(`${label} commit subject must start with ${rule.subject}`);
      if (!new RegExp(`^Lane: ${lane}$`, "m").test(message)) failures.push(`${label} commit is missing Lane: ${lane} trailer`);
      if (!new RegExp(`^Base-SHA: ${baseSha}$`, "m").test(message)) failures.push(`${label} commit is missing the correct Base-SHA trailer`);
      const changed = toAppPaths(changedRepositoryPaths(repositoryRoot, baseSha, handoff.commit_sha), appPrefix, failures, label);
      const declared = [...(handoff.changed_paths ?? [])].sort();
      if (!equalArrays(changed, declared)) failures.push(`${label} changed_paths do not match Git`);
      for (const changedPath of changed) if (!pathAllowed(changedPath, rule.ownedPaths)) failures.push(`${label} changed forbidden path ${changedPath}`);
      for (const required of rule.requiredFiles) if (!changed.includes(required)) failures.push(`${label} commit must change ${required}`);
      if (!changed.some((item) => item.startsWith(rule.testPrefix))) failures.push(`${label} commit must add a lane-owned test`);
      if (changed.includes("src/types.ts")) failures.push(`${label} must not edit src/types.ts`);
    } catch (error) {
      failures.push(`${label} Git verification failed: ${error.message}`);
    }
  }

  const requests = handoff.shared_requests;
  if (!Array.isArray(requests)) failures.push(`${label} shared_requests must be an array`);
  else if (!rule.sharedSymbol && requests.length) failures.push(`${label} must not request a shared type`);
  else if (rule.sharedSymbol) {
    if (requests.length !== 1) failures.push(`${label} must contain one shared request`);
    else if (requests[0].path !== "src/types.ts" || requests[0].symbol !== rule.sharedSymbol || typeof requests[0].reason !== "string" || requests[0].reason.length < 10) failures.push(`${label} shared request must describe ${rule.sharedSymbol} promotion to src/types.ts`);
  }
  if (handoff.rollback !== `git revert ${handoff.commit_sha}`) failures.push(`${label} rollback command must target its commit`);
  verifyOutput(exerciseRoot, handoff.verification, rule, failures, label);
}

function verifyIntegration(repositoryRoot, appPrefix, exerciseRoot, baseSha, handoffs, integration, failures) {
  if (!integration || typeof integration !== "object") {
    failures.push("missing integration evidence");
    return;
  }
  if (integration.schema_version !== 1) failures.push("integration.json schema_version must be 1");
  if (integration.base_sha !== baseSha) failures.push("integration base SHA differs from lane base");
  if (integration.integration_branch !== "integration/parallel-features") failures.push("integration branch must be integration/parallel-features");
  if (!equalArrays(integration.merge_order ?? [], ["B", "A", "C"])) failures.push("integration merge order must be B, A, C");
  const laneById = new Map(handoffs.map((item) => [item.lane, item]));
  let expectedFirstParent = baseSha;
  for (const lane of ["B", "A", "C"]) {
    const mergeCommit = integration.merge_commits?.[lane];
    const laneCommit = laneById.get(lane)?.commit_sha;
    if (!isSha(mergeCommit)) {
      failures.push(`integration merge commit for Lane ${lane} is invalid`);
      continue;
    }
    try {
      const parents = commitParents(repositoryRoot, mergeCommit);
      if (parents.length !== 2 || parents[0] !== expectedFirstParent || parents[1] !== laneCommit) failures.push(`Lane ${lane} must be merged with --no-ff in the required order`);
      const changed = toAppPaths(changedRepositoryPaths(repositoryRoot, parents[0], mergeCommit), appPrefix, failures, `Lane ${lane} merge`);
      for (const appPath of changed) {
        const repositoryPath = `${appPrefix}${appPath}`;
        if (blobId(repositoryRoot, mergeCommit, repositoryPath) !== blobId(repositoryRoot, laneCommit, repositoryPath)) failures.push(`Lane ${lane} merge changed handed-off content in ${appPath}`);
      }
      expectedFirstParent = mergeCommit;
    } catch (error) {
      failures.push(`Lane ${lane} merge verification failed: ${error.message}`);
    }
  }

  const sharedCommit = integration.shared_commit_sha;
  if (!isSha(sharedCommit)) failures.push("shared_commit_sha is invalid");
  else {
    try {
      const parents = commitParents(repositoryRoot, sharedCommit);
      if (parents.length !== 1 || parents[0] !== expectedFirstParent) failures.push("shared-type commit must directly follow the Lane C merge");
      const changed = toAppPaths(changedRepositoryPaths(repositoryRoot, parents[0], sharedCommit), appPrefix, failures, "shared-type commit");
      const expected = ["src/services/workflowApi.ts", "src/types.ts", "src/utils/filters.ts"].sort();
      if (!equalArrays(changed, expected)) failures.push("shared-type commit must change only types.ts, filters.ts, and workflowApi.ts");
      if (integration.product_head !== sharedCommit) failures.push("product_head must be the shared-type commit");
      const types = git(repositoryRoot, ["show", `${sharedCommit}:${appPrefix}src/types.ts`]);
      const filters = git(repositoryRoot, ["show", `${sharedCommit}:${appPrefix}src/utils/filters.ts`]);
      const workflowApi = git(repositoryRoot, ["show", `${sharedCommit}:${appPrefix}src/services/workflowApi.ts`]);
      for (const symbol of ["FilterPreset", "EvidenceBundle"]) if (!new RegExp(`export interface ${symbol}\\b`).test(types)) failures.push(`src/types.ts must export ${symbol}`);
      if (!/import type \{[^}]*FilterPreset[^}]*\} from "\.\.\/types"/s.test(filters) || /export interface FilterPreset\b/.test(filters)) failures.push("filters.ts must import the promoted FilterPreset type");
      if (!/import type \{[^}]*EvidenceBundle[^}]*\} from "\.\.\/types"/s.test(workflowApi) || /export interface EvidenceBundle\b/.test(workflowApi)) failures.push("workflowApi.ts must import the promoted EvidenceBundle type");
    } catch (error) {
      failures.push(`shared-type verification failed: ${error.message}`);
    }
  }

  try {
    const branchHead = git(repositoryRoot, ["rev-parse", "refs/heads/integration/parallel-features"]);
    if (isSha(sharedCommit)) {
      git(repositoryRoot, ["merge-base", "--is-ancestor", sharedCommit, branchHead]);
      const afterProduct = git(repositoryRoot, ["rev-list", "--first-parent", `${sharedCommit}..${branchHead}`]).split(/\r?\n/).filter(Boolean);
      const exercisePrefix = appPrefix.slice(0, -"worktree-feature-app/".length);
      const evidencePrefix = `${exercisePrefix}evidence/`;
      for (const commit of afterProduct) {
        const parent = commitParents(repositoryRoot, commit)[0];
        const changed = changedRepositoryPaths(repositoryRoot, parent, commit);
        for (const item of changed) if (!item.startsWith(evidencePrefix)) failures.push(`commit after product_head changes non-evidence path ${item}`);
      }
    }
  } catch {
    failures.push("integration branch must contain the shared-type product head");
  }
  verifyOutput(exerciseRoot, integration.verification, { command: "npm run test:integrated", output: "evidence/commands/integrated.txt" }, failures, "Integration");
}

export function verifyLaneSubmission({ repositoryRoot, appRoot, exerciseRoot }) {
  const failures = [];
  const evidenceRoot = path.join(exerciseRoot, "evidence");
  const handoffDocument = readJson(path.join(evidenceRoot, "lane-handoffs.json"), failures, "evidence/lane-handoffs.json");
  const integration = readJson(path.join(evidenceRoot, "integration.json"), failures, "evidence/integration.json");
  const beforePath = path.join(evidenceRoot, "worktree-list-before.txt");
  const afterPath = path.join(evidenceRoot, "worktree-list-after.txt");
  if (!fs.existsSync(beforePath)) failures.push("missing evidence/worktree-list-before.txt");
  if (!fs.existsSync(afterPath)) failures.push("missing evidence/worktree-list-after.txt");
  const before = fs.existsSync(beforePath) ? parseWorktreeList(fs.readFileSync(beforePath, "utf8")) : [];
  const after = fs.existsSync(afterPath) ? parseWorktreeList(fs.readFileSync(afterPath, "utf8")) : [];
  for (const rule of Object.values(LANE_RULES)) if (after.some((item) => item.branch === `refs/heads/${rule.branch}`)) failures.push(`${rule.branch} linked worktree still appears in worktree-list-after.txt`);

  if (!handoffDocument || typeof handoffDocument !== "object") return failures;
  if (handoffDocument.schema_version !== 1) failures.push("lane-handoffs.json schema_version must be 1");
  const baseSha = handoffDocument.base_sha;
  if (!isSha(baseSha)) failures.push("lane-handoffs.json base_sha is invalid");
  const handoffs = handoffDocument.lanes;
  if (!Array.isArray(handoffs) || handoffs.length !== 3) failures.push("lane-handoffs.json must contain exactly three lanes");
  else {
    const laneIds = handoffs.map((item) => item.lane).sort();
    if (!equalArrays(laneIds, ["A", "B", "C"])) failures.push("lane-handoffs.json must contain lanes A, B, and C once each");
    const worktreePaths = new Set(handoffs.map((item) => path.resolve(item.worktree_path ?? "")));
    if (worktreePaths.size !== 3) failures.push("each lane must use a different linked worktree path");
    for (const handoff of handoffs) verifyLane(repositoryRoot, `${path.relative(repositoryRoot, appRoot).replaceAll("\\", "/")}/`, exerciseRoot, baseSha, handoff, before, failures);
    verifyIntegration(repositoryRoot, `${path.relative(repositoryRoot, appRoot).replaceAll("\\", "/")}/`, exerciseRoot, baseSha, handoffs, integration, failures);
  }
  const integrationReport = path.join(evidenceRoot, "integration.md");
  if (!fs.existsSync(integrationReport)) failures.push("missing evidence/integration.md");
  else {
    const report = fs.readFileSync(integrationReport, "utf8").toLowerCase();
    for (const term of ["lane review", "shared request", "merge order", "conflict", "shared-type", "final check", "cleanup", "risk", "rollback"]) if (!report.includes(term)) failures.push(`evidence/integration.md is missing ${term}`);
  }
  return [...new Set(failures)];
}

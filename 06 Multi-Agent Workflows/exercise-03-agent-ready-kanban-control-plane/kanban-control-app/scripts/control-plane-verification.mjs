import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { verifyBoardState } from "./board-verification.mjs";

const OWNED_PATHS = ["src/utils/scoring.ts", "src/components/SeverityBadge.tsx", "tests/esc-120/"];
const REQUIRED_LANE_FILES = ["src/utils/scoring.ts", "src/components/SeverityBadge.tsx"];
const CONTROL_PATHS = [
  "docs/agent-board.json",
  "docs/agent-board.md",
  "docs/ownership-map.md",
  "docs/integration-log.md",
  "kanban-control-app/src/data/agent-board.json",
].sort();

function git(root, args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
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

function parents(root, commit) {
  return git(root, ["rev-list", "--parents", "-n", "1", commit]).split(/\s+/).slice(1);
}

function changedPaths(root, from, to) {
  return git(root, ["diff", "--name-only", "--diff-filter=ACMR", from, to]).split(/\r?\n/).filter(Boolean).map((item) => item.replaceAll("\\", "/"));
}

function allowed(candidate, entries) {
  return entries.some((entry) => entry.endsWith("/") ? candidate.startsWith(entry) : candidate === entry);
}

function verifyOutput(exerciseRoot, record, expected, reviewedSha, failures, label) {
  if (!record || typeof record !== "object") {
    failures.push(`${label} verification is missing`);
    return;
  }
  if (record.command !== expected.command) failures.push(`${label} command must be ${expected.command}`);
  if (record.exit_code !== 0) failures.push(`${label} command must exit 0`);
  if (record.output_path !== expected.output) failures.push(`${label} output_path must be ${expected.output}`);
  const output = resolveInside(exerciseRoot, record.output_path, failures, `${label} output`);
  if (!output || !fs.existsSync(output)) failures.push(`missing ${record.output_path ?? `${label} output`}`);
  else {
    if (!/^[a-f0-9]{64}$/.test(record.output_sha256 ?? "") || hashFile(output) !== record.output_sha256) failures.push(`${label} output hash does not match`);
    const text = fs.readFileSync(output, "utf8");
    if (text.length < 120 || !/pass/i.test(text)) failures.push(`${label} output must contain a complete passing result`);
    if (!text.includes(reviewedSha)) failures.push(`${label} output does not name the reviewed SHA`);
  }
}

function verifyReview(exerciseRoot, lane, failures) {
  if (lane.review_path !== "evidence/completed-lane.md") failures.push("lane review_path must be evidence/completed-lane.md");
  const review = resolveInside(exerciseRoot, lane.review_path, failures, "lane review");
  if (!review || !fs.existsSync(review)) failures.push("missing evidence/completed-lane.md");
  else {
    if (!/^[a-f0-9]{64}$/.test(lane.review_sha256 ?? "") || hashFile(review) !== lane.review_sha256) failures.push("completed-lane review hash does not match");
    const text = fs.readFileSync(review, "utf8").toLowerCase();
    for (const term of ["base sha", "lane commit", "owned paths", "changed paths", "feature command", "reviewer decision", "merge commit", "rollback", "remaining risk"]) if (!text.includes(term)) failures.push(`completed-lane.md is missing ${term}`);
    for (const sha of [lane.base_sha, lane.commit_sha]) if (!text.includes(sha)) failures.push(`completed-lane.md does not name ${sha}`);
  }
}

export function verifyControlPlaneSubmission({ repositoryRoot, appRoot, exerciseRoot }) {
  const failures = verifyBoardState({ exerciseRoot, appRoot });
  const evidence = readJson(path.join(exerciseRoot, "evidence", "control-plane.json"), failures, "evidence/control-plane.json");
  if (!evidence) return failures;
  if (evidence.schema_version !== 1) failures.push("control-plane.json schema_version must be 1");
  const baseSha = evidence.base_sha;
  const lane = evidence.lane;
  const integration = evidence.integration;
  if (!isSha(baseSha)) failures.push("base_sha is invalid");
  if (!lane || typeof lane !== "object") failures.push("lane evidence is missing");
  if (!integration || typeof integration !== "object") failures.push("integration evidence is missing");
  if (!lane || !integration) return failures;

  if (lane.card_id !== "ESC-120") failures.push("only ESC-120 may be implemented");
  if (typeof lane.agent !== "string" || lane.agent.trim().length < 5) failures.push("lane agent and session identifier is missing");
  if (lane.branch !== "lane/esc-120-inherited-severity") failures.push("lane branch must be lane/esc-120-inherited-severity");
  if (lane.base_sha !== baseSha) failures.push("lane base_sha differs from the control-plane base");
  if (!isSha(lane.commit_sha)) failures.push("lane commit_sha is invalid");
  if (JSON.stringify(lane.owned_paths) !== JSON.stringify(OWNED_PATHS)) failures.push("lane owned_paths do not match the fixed card ownership");
  if (lane.reviewer !== "risk-owner" || lane.review_decision !== "accept") failures.push("risk-owner must accept the exact lane commit");

  const appPrefix = `${path.relative(repositoryRoot, appRoot).replaceAll("\\", "/")}/`;
  const exercisePrefix = `${path.relative(repositoryRoot, exerciseRoot).replaceAll("\\", "/")}/`;
  if (isSha(baseSha) && isSha(lane.commit_sha)) {
    try {
      const laneParents = parents(repositoryRoot, lane.commit_sha);
      if (laneParents.length !== 1 || laneParents[0] !== baseSha) failures.push("ESC-120 lane commit must have the base SHA as its only parent");
      if (git(repositoryRoot, ["rev-parse", `refs/heads/${lane.branch}`]) !== lane.commit_sha) failures.push("lane branch no longer points to the reviewed commit");
      const message = git(repositoryRoot, ["show", "-s", "--format=%B", lane.commit_sha]);
      if (!message.toLowerCase().startsWith("esc-120:")) failures.push("lane commit subject must start with esc-120:");
      if (!/^Card: ESC-120$/m.test(message)) failures.push("lane commit is missing Card: ESC-120 trailer");
      if (!new RegExp(`^Base-SHA: ${baseSha}$`, "m").test(message)) failures.push("lane commit is missing the correct Base-SHA trailer");
      const repositoryPaths = changedPaths(repositoryRoot, baseSha, lane.commit_sha);
      const lanePaths = repositoryPaths.map((item) => item.startsWith(appPrefix) ? item.slice(appPrefix.length) : null).filter(Boolean).sort();
      for (const item of repositoryPaths) if (!item.startsWith(appPrefix)) failures.push(`lane changed path outside kanban-control-app: ${item}`);
      if (JSON.stringify(lanePaths) !== JSON.stringify([...(lane.changed_paths ?? [])].sort())) failures.push("lane changed_paths do not match Git");
      for (const item of lanePaths) if (!allowed(item, OWNED_PATHS)) failures.push(`lane changed forbidden path ${item}`);
      for (const item of REQUIRED_LANE_FILES) if (!lanePaths.includes(item)) failures.push(`lane must change ${item}`);
      if (!lanePaths.some((item) => item.startsWith("tests/esc-120/"))) failures.push("lane must add an ESC-120 regression test");
    } catch (error) {
      failures.push(`lane Git verification failed: ${error.message}`);
    }
  }
  verifyOutput(exerciseRoot, lane.verification, { command: "npm run feature:verify", output: "evidence/commands/esc-120.txt" }, lane.commit_sha, failures, "ESC-120");
  verifyReview(exerciseRoot, lane, failures);

  if (integration.branch !== "integration/kanban-control") failures.push("integration branch must be integration/kanban-control");
  if (integration.decision !== "accept") failures.push("integration decision must be accept");
  const mergeSha = integration.merge_commit_sha;
  const controlSha = integration.control_commit_sha;
  if (!isSha(mergeSha)) failures.push("merge_commit_sha is invalid");
  if (!isSha(controlSha)) failures.push("control_commit_sha is invalid");
  if (lane.rollback !== `git revert ${mergeSha}`) failures.push("lane rollback must target the accepted merge commit");
  if (isSha(mergeSha) && isSha(controlSha)) {
    try {
      const mergeParents = parents(repositoryRoot, mergeSha);
      if (mergeParents.length !== 2 || mergeParents[0] !== baseSha || mergeParents[1] !== lane.commit_sha) failures.push("ESC-120 must be merged from the base with --no-ff");
      const laneRepositoryPaths = changedPaths(repositoryRoot, baseSha, lane.commit_sha);
      for (const repositoryPath of laneRepositoryPaths) {
        const laneBlob = git(repositoryRoot, ["rev-parse", `${lane.commit_sha}:${repositoryPath}`]);
        const mergeBlob = git(repositoryRoot, ["rev-parse", `${mergeSha}:${repositoryPath}`]);
        if (laneBlob !== mergeBlob) failures.push(`merge changed reviewed lane content in ${repositoryPath.slice(appPrefix.length)}`);
      }
      const controlParents = parents(repositoryRoot, controlSha);
      if (controlParents.length !== 1 || controlParents[0] !== mergeSha) failures.push("control commit must directly follow the ESC-120 merge");
      const controlPaths = changedPaths(repositoryRoot, mergeSha, controlSha).map((item) => item.startsWith(exercisePrefix) ? item.slice(exercisePrefix.length) : item).sort();
      if (JSON.stringify(controlPaths) !== JSON.stringify(CONTROL_PATHS)) failures.push("control commit must update exactly both board mirrors and the three control documents");
      const branchHead = git(repositoryRoot, ["rev-parse", `refs/heads/${integration.branch}`]);
      git(repositoryRoot, ["merge-base", "--is-ancestor", controlSha, branchHead]);
      const later = git(repositoryRoot, ["rev-list", "--first-parent", `${controlSha}..${branchHead}`]).split(/\r?\n/).filter(Boolean);
      for (const commit of later) {
        const parent = parents(repositoryRoot, commit)[0];
        for (const item of changedPaths(repositoryRoot, parent, commit)) if (!item.startsWith(`${exercisePrefix}evidence/`)) failures.push(`commit after control_commit_sha changes non-evidence path ${item}`);
      }
    } catch (error) {
      failures.push(`integration Git verification failed: ${error.message}`);
    }
  }
  verifyOutput(exerciseRoot, integration.board_verification, { command: "npm run board:verify", output: "evidence/commands/board.txt" }, controlSha, failures, "Board");
  return [...new Set(failures)];
}

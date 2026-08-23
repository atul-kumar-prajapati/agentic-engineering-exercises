import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { buildReviewPrompt, normalizedPrompt, sha256 } from "./review-eval-verification.mjs";

function argument(name) {
  const index = process.argv.indexOf(name);
  if (index === -1 || !process.argv[index + 1]) throw new Error(`Missing ${name}`);
  return process.argv[index + 1];
}

const lane = argument("--lane");
if (!['before', 'after'].includes(lane)) throw new Error("--lane must be before or after");
const caseId = argument("--case");
const agent = argument("--agent");
const model = argument("--model");
const tools = argument("--tools");
const permissions = argument("--permissions");
const timeLimitMinutes = Number(argument("--time-limit"));
const adapter = path.resolve(argument("--adapter"));
if (!Number.isInteger(timeLimitMinutes) || timeLimitMinutes <= 0) throw new Error("--time-limit must be a positive integer");
if (!fs.existsSync(adapter)) throw new Error("--adapter must point to an executable Node adapter that reads the prompt from stdin and writes one JSON response to stdout");

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const evidenceRoot = path.join(exerciseRoot, "evidence");
const cases = JSON.parse(fs.readFileSync(path.join(appRoot, "eval", "cases.json"), "utf8"));
const item = cases.find((candidate) => candidate.id === caseId);
if (!item) throw new Error(`Unknown case ${caseId}`);
const diffPath = path.resolve(appRoot, "eval", item.diff);
const diff = fs.readFileSync(diffPath, "utf8");
const sourceSha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: appRoot, encoding: "utf8" }).trim();
const skillPath = path.join(appRoot, "skills", "regression-review", "SKILL.md");
const skillSha256 = lane === "after" ? sha256(fs.readFileSync(skillPath)) : null;
const runNonce = crypto.randomUUID();
const prompt = buildReviewPrompt({ runNonce, item, diff });
const promptRelative = `prompts/${lane}/${caseId}.md`;
const transcriptRelative = `transcripts/${lane}-${caseId}.json`;
const promptPath = path.join(evidenceRoot, promptRelative);
const transcriptPath = path.join(evidenceRoot, transcriptRelative);
fs.mkdirSync(path.dirname(promptPath), { recursive: true });
fs.mkdirSync(path.dirname(transcriptPath), { recursive: true });
fs.writeFileSync(promptPath, prompt);

const startedAt = new Date().toISOString();
const started = performance.now();
const adapterDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "review-adapter-run-"));
let result;
try {
  result = spawnSync(process.execPath, [adapter], {
    cwd: adapterDirectory,
    input: prompt,
    encoding: "utf8",
    timeout: timeLimitMinutes * 60_000,
    env: { ...process.env, REVIEW_RUN_NONCE: runNonce, REVIEW_RUN_LANE: lane, REVIEW_SKILL_PATH: lane === "after" ? skillPath : "" },
  });
} finally {
  fs.rmSync(adapterDirectory, { recursive: true, force: true });
}
const durationMs = Math.max(1, Math.round(performance.now() - started));
if (result.error) throw result.error;
if (result.status !== 0) throw new Error(`review adapter failed with ${result.status}:\n${result.stderr || result.stdout}`);
let response;
try { response = JSON.parse(result.stdout); }
catch { throw new Error("review adapter stdout must be one JSON object"); }
if (response.runNonce !== runNonce) throw new Error("review adapter response must repeat the supplied runNonce");
fs.writeFileSync(transcriptPath, result.stdout);
const runnerSource = fs.readFileSync(new URL(import.meta.url));
const run = {
  schemaVersion: 3,
  lane,
  caseId,
  sessionId: response.sessionId,
  agent,
  model,
  tools,
  permissions,
  promptSha256: sha256(normalizedPrompt(prompt, runNonce)),
  promptPath: promptRelative,
  startedAt,
  durationMs,
  timeLimitMinutes,
  sourceSha,
  diffSha256: sha256(diff),
  transcriptPath: transcriptRelative,
  transcriptSha256: sha256(result.stdout),
  skillSha256,
  runNonce,
  runnerSha256: sha256(runnerSource),
  adapterSha256: sha256(fs.readFileSync(adapter)),
  runnerCommand: `node ${path.basename(adapter)}`,
  runnerExitCode: result.status,
  mergeDecision: response.mergeDecision,
  findings: response.findings,
};
const runPath = path.join(evidenceRoot, "runs", lane, `${caseId}.json`);
fs.mkdirSync(path.dirname(runPath), { recursive: true });
fs.writeFileSync(runPath, `${JSON.stringify(run, null, 2)}\n`);
console.log(`PASS captured ${lane}/${caseId} with runner nonce ${runNonce}`);

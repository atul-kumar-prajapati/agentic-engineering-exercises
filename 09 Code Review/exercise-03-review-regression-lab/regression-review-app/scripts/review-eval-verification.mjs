import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

export const sha256 = (value) => crypto.createHash("sha256").update(Buffer.isBuffer(value) ? value : String(value).replaceAll("\r\n", "\n")).digest("hex");
const metric = (found, total) => total === 0 ? 1 : Math.min(found / total, 1);

export function buildReviewPrompt({ runNonce, item, diff }) {
  const rules = item.acceptanceRules.map((rule) => `- ${rule}`).join("\n");
  return `RUN_NONCE: ${runNonce}\n\nReview this code change against every acceptance rule below. Return one JSON object containing runNonce, sessionId, mergeDecision, and findings. Each finding needs an arbitrary unique id, severity, file, an exact added-line anchor, the acceptance-rule text it evaluates as requirement, behavior, impact, reproduction, recommendation, and blocking. Do not invent a blocker when the diff conforms.\n\nAcceptance rules:\n${rules}\n\nDiff:\n${diff}`;
}

export function normalizedPrompt(prompt, nonce) {
  return prompt.replace(`RUN_NONCE: ${nonce}`, "RUN_NONCE: <RUNNER_NONCE>");
}

function diffFacts(source) {
  const files = new Set();
  const anchors = new Map();
  let current = null;
  for (const line of source.replaceAll("\r\n", "\n").split("\n")) {
    const header = line.match(/^diff --git a\/(.+?) b\/(.+)$/);
    if (header) {
      current = header[2];
      files.add(current);
      anchors.set(current, new Set());
    } else if (current && line.startsWith("+") && !line.startsWith("+++")) {
      const anchor = line.slice(1).trim();
      if (anchor.length >= 4) anchors.get(current).add(anchor);
    }
  }
  return { files, anchors };
}

function inside(root, candidate) {
  const relative = path.relative(path.resolve(root), path.resolve(candidate));
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function readRun({ evidenceRoot, lane, item, skillSha, runnerSha, failures }) {
  const relativeRun = `runs/${lane}/${item.id}.json`;
  const file = path.join(evidenceRoot, relativeRun);
  let run;
  try { run = JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { failures.push(`missing or invalid ${relativeRun}`); return null; }
  if (run.schemaVersion !== 3 || run.lane !== lane || run.caseId !== item.id) failures.push(`${lane}/${item.id} identity is incorrect`);
  for (const field of ["sessionId", "agent", "model", "tools", "permissions", "promptSha256", "runNonce", "runnerCommand", "adapterSha256"]) {
    if (typeof run[field] !== "string" || run[field].trim().length < 3) failures.push(`${lane}/${item.id} is missing ${field}`);
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(run.runNonce ?? "")) failures.push(`${lane}/${item.id} run nonce is invalid`);
  if (!/^[a-f0-9]{64}$/.test(run.adapterSha256 ?? "")) failures.push(`${lane}/${item.id} adapter digest is invalid`);
  if (run.runnerSha256 !== runnerSha || run.runnerExitCode !== 0) failures.push(`${lane}/${item.id} was not captured by the protected runner`);
  if (!Number.isFinite(Date.parse(run.startedAt ?? "")) || !Number.isInteger(run.durationMs) || run.durationMs <= 0 || !Number.isInteger(run.timeLimitMinutes) || run.timeLimitMinutes <= 0) failures.push(`${lane}/${item.id} timing metadata is invalid`);
  if (!/^[a-f0-9]{40}$/.test(run.sourceSha ?? "")) failures.push(`${lane}/${item.id} sourceSha is invalid`);

  const diffPath = path.resolve(process.cwd(), "eval", item.diff);
  const diffSource = fs.existsSync(diffPath) ? fs.readFileSync(diffPath, "utf8") : "";
  if (!diffSource || run.diffSha256 !== sha256(diffSource)) failures.push(`${lane}/${item.id} diff digest is incorrect`);
  const facts = diffFacts(diffSource);

  const expectedPromptRelative = `prompts/${lane}/${item.id}.md`;
  const promptPath = path.resolve(evidenceRoot, run.promptPath ?? "");
  if (!inside(evidenceRoot, promptPath) || !fs.existsSync(promptPath) || String(run.promptPath).replaceAll("\\", "/") !== expectedPromptRelative) {
    failures.push(`${lane}/${item.id} runner prompt is missing, misplaced, or outside evidence`);
  } else {
    const prompt = fs.readFileSync(promptPath, "utf8").replaceAll("\r\n", "\n");
    const expectedPrompt = buildReviewPrompt({ runNonce: run.runNonce, item, diff: diffSource }).replaceAll("\r\n", "\n");
    if (prompt !== expectedPrompt) failures.push(`${lane}/${item.id} prompt differs from the protected runner prompt`);
    if (run.promptSha256 !== sha256(normalizedPrompt(prompt, run.runNonce))) failures.push(`${lane}/${item.id} prompt digest is incorrect`);
  }

  const expectedTranscriptRelative = `transcripts/${lane}-${item.id}.json`;
  const transcriptPath = path.resolve(evidenceRoot, run.transcriptPath ?? "");
  let transcript = "";
  let response;
  if (!inside(evidenceRoot, transcriptPath) || !fs.existsSync(transcriptPath) || String(run.transcriptPath).replaceAll("\\", "/") !== expectedTranscriptRelative) {
    failures.push(`${lane}/${item.id} transcript is missing, misplaced, or outside evidence`);
  } else {
    transcript = fs.readFileSync(transcriptPath, "utf8");
    if (run.transcriptSha256 !== sha256(transcript)) failures.push(`${lane}/${item.id} transcript digest is incorrect`);
    try { response = JSON.parse(transcript); }
    catch { failures.push(`${lane}/${item.id} transcript is not the adapter JSON response`); }
    if (response && (response.runNonce !== run.runNonce || response.sessionId !== run.sessionId || response.mergeDecision !== run.mergeDecision || JSON.stringify(response.findings) !== JSON.stringify(run.findings))) {
      failures.push(`${lane}/${item.id} run fields do not match the nonce-bound adapter response`);
    }
  }

  if (lane === "before" && run.skillSha256 !== null) failures.push(`${lane}/${item.id} must not receive the skill`);
  if (lane === "after" && run.skillSha256 !== skillSha) failures.push(`${lane}/${item.id} skill digest is incorrect`);
  if (!['approve', 'request-changes'].includes(run.mergeDecision)) failures.push(`${lane}/${item.id} mergeDecision is invalid`);
  if (!Array.isArray(run.findings)) failures.push(`${lane}/${item.id} findings must be an array`);
  const ids = new Set();
  const signatures = new Set();
  for (const finding of run.findings ?? []) {
    if (typeof finding.id !== "string" || finding.id.length < 2 || ids.has(finding.id)) failures.push(`${lane}/${item.id} finding IDs must be unique`);
    ids.add(finding.id);
    if (!['critical', 'high', 'medium', 'low'].includes(finding.severity) || typeof finding.blocking !== "boolean") failures.push(`${lane}/${item.id}/${finding.id} severity or blocking flag is invalid`);
    for (const [field, minimum] of Object.entries({ file: 5, anchor: 4, requirement: 20, behavior: 30, impact: 30, reproduction: 30, recommendation: 20 })) {
      if (typeof finding[field] !== "string" || finding[field].trim().length < minimum) failures.push(`${lane}/${item.id}/${finding.id} needs concrete ${field}`);
    }
    if (!facts.files.has(finding.file)) failures.push(`${lane}/${item.id}/${finding.id} file is not changed by the evaluated diff`);
    if (!facts.anchors.get(finding.file)?.has(finding.anchor?.trim())) failures.push(`${lane}/${item.id}/${finding.id} anchor must be one exact added line from the evaluated diff`);
    const signature = `${finding.file}:${finding.anchor?.trim()}`;
    if (signatures.has(signature)) failures.push(`${lane}/${item.id} repeats one changed line as multiple findings`);
    signatures.add(signature);
    for (const field of ["id", "anchor", "requirement", "behavior", "impact", "reproduction", "recommendation"]) {
      if (response && !transcript.includes(finding[field])) failures.push(`${lane}/${item.id}/${finding.id} transcript does not contain its submitted ${field}`);
    }
  }
  const blockers = (run.findings ?? []).filter((finding) => finding.blocking);
  const consistentDecision = blockers.length ? "request-changes" : "approve";
  if (run.mergeDecision !== consistentDecision) failures.push(`${lane}/${item.id} mergeDecision is inconsistent with its blocking findings`);
  return run;
}

function laneMetrics(runs, cases) {
  const coverage = {};
  let supported = 0;
  let reported = 0;
  let cleanControl = 1;
  for (const item of cases) {
    const run = runs.get(item.id);
    const blockers = (run?.findings ?? []).filter((finding) => finding.blocking);
    reported += blockers.length;
    if (item.expectation === "regressions") {
      const matchedRules = new Set(blockers.map((finding) => finding.requirement).filter((rule) => item.acceptanceRules.includes(rule)));
      coverage[item.id] = metric(matchedRules.size, item.acceptanceRules.length);
      supported += matchedRules.size;
    } else if (blockers.length || run?.mergeDecision !== "approve") cleanControl = 0;
  }
  return {
    historicalCoverage: coverage["historical-regression"] ?? 0,
    securityCoverage: coverage["security-regression"] ?? 0,
    precision: metric(supported, reported),
    cleanControl,
    acceptanceRules: cases.filter((item) => item.expectation === "regressions").reduce((sum, item) => sum + item.acceptanceRules.length, 0),
    supportedBlockingFindings: supported,
    totalBlockingFindings: reported,
  };
}

export function buildScorecard({ evidenceRoot, cases, skillSource, runnerSource }) {
  const failures = [];
  const skillSha = sha256(skillSource);
  const runnerSha = sha256(runnerSource);
  const lanes = { before: new Map(), after: new Map() };
  const sessions = new Set();
  const nonces = new Set();
  for (const lane of Object.keys(lanes)) for (const item of cases) {
    const run = readRun({ evidenceRoot, lane, item, skillSha, runnerSha, failures });
    if (!run) continue;
    if (sessions.has(run.sessionId)) failures.push(`session ID reused across runs: ${run.sessionId}`);
    if (nonces.has(run.runNonce)) failures.push(`runner nonce reused across runs: ${run.runNonce}`);
    sessions.add(run.sessionId);
    nonces.add(run.runNonce);
    lanes[lane].set(item.id, run);
  }
  for (const item of cases) {
    const before = lanes.before.get(item.id);
    const after = lanes.after.get(item.id);
    if (!before || !after) continue;
    for (const field of ["agent", "model", "tools", "permissions", "promptSha256", "timeLimitMinutes", "diffSha256", "adapterSha256"]) {
      if (before[field] !== after[field]) failures.push(`${item.id} before and after runs differ in ${field}`);
    }
  }
  const metrics = { before: laneMetrics(lanes.before, cases), after: laneMetrics(lanes.after, cases) };
  const noRegression = ["historicalCoverage", "securityCoverage", "precision", "cleanControl"].every((field) => metrics.after[field] + 0.05 >= metrics.before[field]);
  const gates = {
    historicalCoverage: metrics.after.historicalCoverage >= 1,
    securityCoverage: metrics.after.securityCoverage >= 1,
    precision: metrics.after.precision >= 0.8,
    cleanControl: metrics.after.cleanControl === 1,
    noRegression,
  };
  return { failures: [...new Set(failures)], scorecard: { schemaVersion: 3, skillSha256: skillSha, runnerSha256: runnerSha, metrics, gates, decision: Object.values(gates).every(Boolean) ? "adopt" : "reject" } };
}

function git(root, args) { return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim(); }

export function verifySkillGitBinding({ repositoryRoot, exerciseRoot, sourceSha, skillSha256 }) {
  const failures = [];
  try {
    const head = git(repositoryRoot, ["rev-parse", "HEAD"]);
    git(repositoryRoot, ["merge-base", "--is-ancestor", sourceSha, head]);
    const prefix = path.relative(repositoryRoot, exerciseRoot).split(path.sep).join("/");
    const skillPrefix = `${prefix}/regression-review-app/skills/regression-review/`;
    const skillPath = `${skillPrefix}SKILL.md`;
    const committedSkill = execFileSync("git", ["show", `${sourceSha}:${skillPath}`], { cwd: repositoryRoot });
    if (sha256(committedSkill) !== skillSha256) failures.push("submitted skill does not match its source commit");
    const sourceFiles = git(repositoryRoot, ["diff-tree", "--no-commit-id", "--name-only", "-r", sourceSha]).split(/\r?\n/).filter(Boolean);
    if (!sourceFiles.length || sourceFiles.some((file) => !file.startsWith(skillPrefix))) failures.push("skill source commit must change only the regression-review skill folder");
    const later = git(repositoryRoot, ["diff", "--name-only", sourceSha, head]).split(/\r?\n/).filter(Boolean);
    for (const file of later) if (!file.startsWith(`${prefix}/evidence/`)) failures.push(`commit after the skill source changes non-evidence file ${file}`);
  } catch { failures.push("skill source SHA must be an ancestor with a focused skill-only commit"); }
  return failures;
}

export function verifySkillContents(skillSource, { supportingSources = [], cases = [], diffSources = [] } = {}) {
  const failures = [];
  if (!/^---\s*\nname:\s*regression-review\s*\ndescription:\s*.+\n---/m.test(skillSource)) failures.push("SKILL.md frontmatter is invalid");
  if (skillSource.trim().length < 500 || skillSource.trim().length > 5000) failures.push("SKILL.md must be 500-5000 characters");
  for (const term of ["reproduce", "severity", "code anchor", "dismiss"]) if (!skillSource.toLowerCase().includes(term)) failures.push(`SKILL.md is missing ${term}`);
  const packageText = [skillSource, ...supportingSources].join("\n").toLowerCase();
  for (const phrase of ["historical-regression", "security-regression", "clean-control", "hist-", "multi-", "startswith", "json.parse", "slice(0"]) {
    if (packageText.includes(phrase)) failures.push(`skill package leaks protected case detail: ${phrase}`);
  }
  for (const rule of cases.flatMap((item) => item.acceptanceRules ?? [])) if (packageText.includes(rule.toLowerCase())) failures.push("skill package copies a protected acceptance rule");
  for (const source of diffSources) for (const anchors of diffFacts(source).anchors.values()) for (const anchor of anchors) {
    if (anchor.length >= 12 && packageText.includes(anchor.toLowerCase())) failures.push("skill package copies an exact protected diff line");
  }
  return [...new Set(failures)];
}

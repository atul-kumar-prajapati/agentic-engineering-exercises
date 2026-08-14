import crypto from "node:crypto";
import path from "node:path";
import { execFileSync } from "node:child_process";

const sha256 = (value) => crypto.createHash("sha256").update(value.replaceAll("\r\n", "\n")).digest("hex");

function valueAt(object, paths) {
  for (const parts of paths) {
    let value = object;
    for (const part of parts) value = value?.[part];
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
}

export function normalizePromptfooResults(document) {
  const resultEnvelope = document?.results && !Array.isArray(document.results) ? document.results : document?.data ?? {};
  const rows = Array.isArray(document) ? document : resultEnvelope?.results ?? document?.results;
  if (!Array.isArray(rows)) throw new Error("Raw Promptfoo JSON does not contain a results array");
  const prompts = resultEnvelope?.prompts ?? document?.config?.prompts ?? [];
  const providers = resultEnvelope?.providers ?? document?.config?.providers ?? [];
  const tests = document?.config?.tests ?? [];
  return rows.map((row, index) => {
    const configuredTest = Number.isInteger(row?.testIdx) ? tests[row.testIdx] : undefined;
    const configuredPrompt = Number.isInteger(row?.promptIdx) ? prompts[row.promptIdx] : undefined;
    const configuredProvider = Number.isInteger(row?.providerIdx) ? providers[row.providerIdx] : undefined;
    const metadata = valueAt(row, [["metadata"], ["testCase", "metadata"], ["test", "metadata"]]) ?? configuredTest?.metadata ?? {};
    const promptLabel = valueAt(row, [["prompt", "label"], ["prompt", "display"], ["promptLabel"]])
      ?? configuredPrompt?.label ?? configuredPrompt?.display ?? (row?.promptIdx === 0 ? "baseline" : row?.promptIdx === 1 ? "candidate" : undefined);
    const provider = valueAt(row, [["provider", "id"], ["provider", "label"], ["provider"]])
      ?? configuredProvider?.id ?? configuredProvider?.label ?? configuredProvider;
    let output = valueAt(row, [["response", "output"], ["response", "text"], ["output"]]);
    if (typeof output !== "string" && output !== undefined) output = JSON.stringify(output);
    const caseId = metadata.caseId ?? row?.vars?.caseId;
    const sample = Number(metadata.sample ?? row?.vars?.sample);
    return {
      sampleKey: `${promptLabel}:${caseId}:${sample}`,
      promptLabel,
      caseId,
      sample,
      provider: typeof provider === "string" ? provider : "",
      output: typeof output === "string" ? output : "",
      responseSha256: typeof output === "string" ? sha256(output) : "",
      latencyMs: Number(row?.latencyMs ?? row?.response?.latencyMs ?? 0),
      success: row?.success !== false && !row?.error,
      index,
    };
  });
}

function isRemoteModelProvider(provider) {
  return typeof provider === "string"
    && provider.includes(":")
    && !/^(echo|file|exec|python|javascript|custom|local|ollama|localai|llama|http):/i.test(provider);
}

function metric(found, denominator) { return denominator === 0 ? 1 : found / denominator; }
function range(values) { return Math.max(...values) - Math.min(...values); }

export function buildScorecard({ rawDocument, rawText, judgments, cases, run, baselinePrompt, candidatePrompt }) {
  const failures = [];
  let rows = [];
  try { rows = normalizePromptfooResults(rawDocument); }
  catch (error) { failures.push(error.message); }
  const expectedKeys = [];
  for (const prompt of ["baseline", "candidate"]) for (const item of cases) for (const sample of [1, 2, 3]) expectedKeys.push(`${prompt}:${item.id}:${sample}`);
  const rowByKey = new Map();
  for (const row of rows) {
    if (rowByKey.has(row.sampleKey)) failures.push(`duplicate raw sample ${row.sampleKey}`);
    rowByKey.set(row.sampleKey, row);
    if (!row.success) failures.push(`raw sample failed: ${row.sampleKey}`);
    if (row.output.trim().length < 80) failures.push(`raw response is too short: ${row.sampleKey}`);
    if (!isRemoteModelProvider(row.provider)) failures.push(`sample does not identify a permitted remote model provider: ${row.sampleKey}`);
    if (!(row.latencyMs > 0)) failures.push(`sample has no positive model latency: ${row.sampleKey}`);
  }
  for (const key of expectedKeys) if (!rowByKey.has(key)) failures.push(`missing raw sample ${key}`);
  for (const key of rowByKey.keys()) if (!expectedKeys.includes(key)) failures.push(`unexpected raw sample ${key}`);

  const providers = [...new Set(rows.map((row) => row.provider))];
  if (providers.length !== 1 || providers[0] !== run?.provider) failures.push("all samples and run metadata must use one identical provider");
  if (run?.schemaVersion !== 1 || run?.sampleCountPerPromptCase !== 3 || run?.temperature !== 0 || run?.cacheDisabled !== true) failures.push("run metadata must declare schemaVersion 1, three samples, temperature 0, and disabled cache");
  if (run?.rawResultsSha256 !== sha256(rawText)) failures.push("run metadata rawResultsSha256 does not match raw Promptfoo output");
  if (run?.baselinePromptSha256 !== sha256(baselinePrompt) || run?.candidatePromptSha256 !== sha256(candidatePrompt)) failures.push("run metadata prompt hashes do not match evaluated prompts");
  if (!/^[a-f0-9]{40}$/.test(run?.candidatePromptSourceSha ?? "")) failures.push("candidatePromptSourceSha must be a full commit SHA");

  const expectedByCase = new Map(cases.map((item) => [item.id, item.expectedFindingIds]));
  const judgmentByKey = new Map();
  if (!Array.isArray(judgments) || judgments.length !== expectedKeys.length) failures.push("judgments must contain exactly 18 entries");
  for (const judgment of judgments ?? []) {
    if (judgmentByKey.has(judgment.sampleKey)) failures.push(`duplicate judgment ${judgment.sampleKey}`);
    judgmentByKey.set(judgment.sampleKey, judgment);
    const row = rowByKey.get(judgment.sampleKey);
    if (!row) continue;
    if (judgment.responseSha256 !== row.responseSha256) failures.push(`judgment response hash mismatch: ${judgment.sampleKey}`);
    if (!Array.isArray(judgment.foundFindingIds) || new Set(judgment.foundFindingIds).size !== judgment.foundFindingIds.length) failures.push(`invalid finding list: ${judgment.sampleKey}`);
    const allowed = expectedByCase.get(row.caseId) ?? [];
    for (const id of judgment.foundFindingIds ?? []) if (!allowed.includes(id)) failures.push(`unknown finding ${id} in ${judgment.sampleKey}`);
    if (typeof judgment.falseBlocker !== "boolean") failures.push(`falseBlocker must be boolean: ${judgment.sampleKey}`);
    if (allowed.length && judgment.falseBlocker) failures.push(`falseBlocker applies only to the clean control: ${judgment.sampleKey}`);
    if (typeof judgment.reviewer !== "string" || judgment.reviewer.trim().length < 3 || typeof judgment.rationale !== "string" || judgment.rationale.trim().length < 50) failures.push(`judgment needs reviewer and concrete rationale: ${judgment.sampleKey}`);
    if (judgment.disputed === true && (typeof judgment.resolvedBy !== "string" || judgment.resolvedBy.trim().length < 3)) failures.push(`disputed judgment needs resolvedBy: ${judgment.sampleKey}`);
  }
  for (const key of expectedKeys) if (!judgmentByKey.has(key)) failures.push(`missing judgment ${key}`);

  function metricsFor(prompt) {
    const historical = cases.find((item) => item.kind === "historical-bad");
    const multi = cases.find((item) => item.kind === "multi-bug");
    const clean = cases.find((item) => item.kind === "clean-control");
    const recalls = (item) => [1, 2, 3].map((sample) => {
      const found = judgmentByKey.get(`${prompt}:${item.id}:${sample}`)?.foundFindingIds?.length ?? 0;
      return metric(found, item.expectedFindingIds.length);
    });
    const historicalRuns = recalls(historical);
    const multiRuns = recalls(multi);
    const cleanRuns = [1, 2, 3].map((sample) => judgmentByKey.get(`${prompt}:${clean.id}:${sample}`)?.falseBlocker === false ? 1 : 0);
    return {
      historicalRecall: historicalRuns.reduce((sum, value) => sum + value, 0) / 3,
      multiBugRecall: multiRuns.reduce((sum, value) => sum + value, 0) / 3,
      cleanPrecision: cleanRuns.reduce((sum, value) => sum + value, 0) / 3,
      perRun: { historical: historicalRuns, multiBug: multiRuns, clean: cleanRuns },
      varianceRange: { historical: range(historicalRuns), multiBug: range(multiRuns), clean: range(cleanRuns) },
    };
  }
  const baseline = metricsFor("baseline");
  const candidate = metricsFor("candidate");
  const regressionPass = ["historicalRecall", "multiBugRecall", "cleanPrecision"].every((name) => candidate[name] + 0.05 >= baseline[name]);
  const gates = {
    historicalRecall: candidate.historicalRecall >= 0.8,
    multiBugRecall: candidate.multiBugRecall >= 0.8,
    cleanPrecision: candidate.cleanPrecision >= 0.9,
    regressionLimit: regressionPass,
  };
  const scorecard = {
    schemaVersion: 1,
    provider: run?.provider,
    rawResultsSha256: sha256(rawText),
    baselinePromptSha256: sha256(baselinePrompt),
    candidatePromptSha256: sha256(candidatePrompt),
    sampleCountPerPromptCase: 3,
    metrics: { baseline, candidate },
    gates,
    adoption: Object.values(gates).every(Boolean) ? "adopt" : "reject",
  };
  return { failures, scorecard, rows };
}

function git(root, args) { return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim(); }

export function verifyPromptGitBinding({ repositoryRoot, exerciseRoot, sourceSha, candidatePromptSha256 }) {
  const failures = [];
  try {
    const head = git(repositoryRoot, ["rev-parse", "HEAD"]);
    git(repositoryRoot, ["merge-base", "--is-ancestor", sourceSha, head]);
    const prefix = path.relative(repositoryRoot, exerciseRoot).split(path.sep).join("/");
    const promptPath = `${prefix}/regression-review-app/eval/review-prompt-candidate.md`;
    const committedPrompt = execFileSync("git", ["show", `${sourceSha}:${promptPath}`], { cwd: repositoryRoot, encoding: "utf8" });
    if (sha256(committedPrompt) !== candidatePromptSha256) failures.push("candidate prompt hash does not match its source commit");
    const sourceFiles = git(repositoryRoot, ["diff-tree", "--no-commit-id", "--name-only", "-r", sourceSha]).split(/\r?\n/).filter(Boolean);
    if (sourceFiles.length !== 1 || sourceFiles[0] !== promptPath) failures.push("candidate prompt source commit must change only the candidate prompt");
    const later = git(repositoryRoot, ["diff", "--name-only", sourceSha, head]).split(/\r?\n/).filter(Boolean);
    for (const file of later) if (!file.startsWith(`${prefix}/evidence/`)) failures.push(`commit after candidate prompt changes non-evidence file ${file}`);
  } catch { failures.push("candidate prompt source SHA must be an ancestor with a focused prompt-only commit"); }
  return failures;
}

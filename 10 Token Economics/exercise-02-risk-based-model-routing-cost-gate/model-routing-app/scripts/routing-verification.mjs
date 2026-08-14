import crypto from "node:crypto";
import path from "node:path";
import { execFileSync } from "node:child_process";

const hash = (value) => crypto.createHash("sha256").update(value.replaceAll("\r\n", "\n")).digest("hex");
const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
const round = (value) => Number(value.toFixed(10));
const nextTier = { fast: "balanced", balanced: "reasoning", reasoning: "reasoning" };
const permittedProvider = (value) => typeof value === "string" && value.includes(":") && !/^(file|echo|exec|python|javascript|custom|local|ollama|localai):/i.test(value);

export function buildRoutingScorecard({ cases, pricing, runs, responses, metadata, decisions }) {
  const failures = [];
  const expectedKeys = cases.flatMap((item) => item.eligibleTiers.flatMap((tier) => [1, 2, 3].map((run) => `${item.id}:${tier}:${run}`)));
  if (!responses || typeof responses !== "object" || Array.isArray(responses)) failures.push("raw responses must be a keyed object");
  const responseKeys = Object.keys(responses ?? {}).sort();
  if (JSON.stringify(responseKeys) !== JSON.stringify([...expectedKeys].sort())) failures.push("raw responses must contain exactly every eligible case, tier, and run");
  if (!Array.isArray(runs) || runs.length !== expectedKeys.length) failures.push(`raw runs must contain exactly ${expectedKeys.length} entries`);
  if (metadata?.schemaVersion !== 1 || metadata?.runsPerLane !== 3 || metadata?.temperature !== 0 || metadata?.cacheDisabled !== true) failures.push("metadata must declare schemaVersion 1, three runs, temperature 0, and disabled cache");
  if (!permittedProvider(metadata?.providerFamily)) failures.push("metadata must identify a permitted remote provider family");
  for (const tier of ["fast", "balanced", "reasoning"]) if (typeof metadata?.models?.[tier] !== "string" || metadata.models[tier].length < 3) failures.push(`metadata is missing ${tier} model`);
  if (!/^[a-f0-9]{40}$/.test(metadata?.sourceSha ?? "")) failures.push("sourceSha must be a full commit SHA");

  const runByKey = new Map();
  for (const run of runs ?? []) {
    if (runByKey.has(run.sampleKey)) failures.push(`duplicate run ${run.sampleKey}`);
    runByKey.set(run.sampleKey, run);
    const [caseId, tier, runNumber] = String(run.sampleKey).split(":");
    if (!expectedKeys.includes(run.sampleKey) || run.caseId !== caseId || run.tier !== tier || run.run !== Number(runNumber)) failures.push(`run fields do not match sampleKey: ${run.sampleKey}`);
    const response = responses?.[run.sampleKey];
    if (typeof response !== "string" || response.trim().length < 80) failures.push(`response is missing or too short: ${run.sampleKey}`);
    if (run.responseSha256 !== (typeof response === "string" ? hash(response) : "")) failures.push(`response hash mismatch: ${run.sampleKey}`);
    if (run.provider !== metadata?.providerFamily || run.model !== metadata?.models?.[run.tier]) failures.push(`provider/model mismatch: ${run.sampleKey}`);
    if (!Number.isInteger(run.inputTokens) || run.inputTokens <= 0 || !Number.isInteger(run.outputTokens) || run.outputTokens <= 0) failures.push(`token counts must be positive integers: ${run.sampleKey}`);
    if (!(run.latencyMs > 0) || !(run.qualityScore >= 0 && run.qualityScore <= 1) || typeof run.safetyPassed !== "boolean") failures.push(`latency, quality, or safety is invalid: ${run.sampleKey}`);
    if (typeof run.gradingRationale !== "string" || run.gradingRationale.trim().length < 50) failures.push(`grading rationale is too short: ${run.sampleKey}`);
  }
  for (const key of expectedKeys) if (!runByKey.has(key)) failures.push(`missing measured run ${key}`);
  const decisionMap = new Map((decisions ?? []).map((entry) => [entry.id, entry.route]));
  if (decisionMap.size !== cases.length) failures.push("routing decisions must cover every case exactly once");
  for (const item of cases) if (decisionMap.get(item.id) !== item.expectedRoute) failures.push(`incorrect route for ${item.id}`);

  const rates = pricing.perMillionTokens;
  const callCost = (run) => (run.inputTokens * rates[run.tier].input + run.outputTokens * rates[run.tier].output) / 1_000_000;
  const caseResults = [];
  for (const item of cases) {
    const route = decisionMap.get(item.id);
    if (route === "clarify") {
      caseResults.push({ id: item.id, route, firstCallCost: 0, expectedAddedCost: 0, totalExpectedCost: 0, expectedLatencyMs: 0, qualityMean: null, qualityRange: null, safetyFailures: 0, failureProbability: 0, escalationRoute: null });
      continue;
    }
    const selected = [1, 2, 3].map((run) => runByKey.get(`${item.id}:${route}:${run}`)).filter(Boolean);
    const escalationRoute = nextTier[route];
    const escalated = [1, 2, 3].map((run) => runByKey.get(`${item.id}:${escalationRoute}:${run}`)).filter(Boolean);
    const failed = selected.filter((run) => run.qualityScore < item.qualityFloor || !run.safetyPassed).length;
    const failureProbability = failed / 3;
    const firstCallCost = mean(selected.map(callCost));
    const escalationCost = mean(escalated.map(callCost));
    const firstLatency = mean(selected.map((run) => run.latencyMs));
    const escalationLatency = mean(escalated.map((run) => run.latencyMs));
    const qualities = selected.map((run) => run.qualityScore);
    caseResults.push({
      id: item.id, route, firstCallCost: round(firstCallCost), expectedAddedCost: round(failureProbability * escalationCost),
      totalExpectedCost: round(firstCallCost + failureProbability * escalationCost), expectedLatencyMs: round(firstLatency + failureProbability * escalationLatency),
      qualityMean: round(mean(qualities)), qualityRange: round(Math.max(...qualities) - Math.min(...qualities)),
      safetyFailures: selected.filter((run) => !run.safetyPassed).length, failureProbability: round(failureProbability), escalationRoute,
    });
  }
  const executable = cases.filter((item) => item.expectedRoute !== "clarify");
  let baseline = 0;
  for (const item of executable) {
    const reasoning = [1, 2, 3].map((run) => runByKey.get(`${item.id}:reasoning:${run}`)).filter(Boolean);
    const cost = mean(reasoning.map(callCost));
    const failureRate = reasoning.filter((run) => run.qualityScore < item.qualityFloor || !run.safetyPassed).length / 3;
    baseline += cost + failureRate * cost;
  }
  const policy = caseResults.reduce((sum, item) => sum + item.totalExpectedCost, 0);
  const savingsPercent = baseline ? ((baseline - policy) / baseline) * 100 : 0;
  const gates = {
    routes: cases.every((item) => decisionMap.get(item.id) === item.expectedRoute),
    quality: executable.every((item) => caseResults.find((result) => result.id === item.id).qualityMean >= item.qualityFloor),
    safety: executable.every((item) => caseResults.find((result) => result.id === item.id).safetyFailures === 0),
    completeness: failures.length === 0,
    savings: savingsPercent >= pricing.minimumSavingsPercent,
  };
  return { failures, scorecard: { schemaVersion: 1, currency: pricing.currency, cases: caseResults, totals: { policyExpectedCost: round(policy), allReasoningExpectedCost: round(baseline), savingsPercent: round(savingsPercent) }, gates, adoption: Object.values(gates).every(Boolean) ? "adopt" : "reject" } };
}

function git(root, args) { return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim(); }
export function verifyRoutingHistory({ repositoryRoot, exerciseRoot, sourceSha }) {
  const failures = [];
  try {
    git(repositoryRoot, ["merge-base", "--is-ancestor", sourceSha, "HEAD"]);
    const prefix = path.relative(repositoryRoot, exerciseRoot).split(path.sep).join("/");
    const expected = [`${prefix}/model-routing-app/src/routing/routeTask.mjs`, `${prefix}/model-routing-app/tests/route-task.test.mjs`].sort();
    const actual = git(repositoryRoot, ["diff-tree", "--no-commit-id", "--name-only", "-r", sourceSha]).split(/\r?\n/).filter(Boolean).sort();
    if (JSON.stringify(actual) !== JSON.stringify(expected)) failures.push("sourceSha must contain only router and learner tests");
    const later = git(repositoryRoot, ["diff", "--name-only", sourceSha, "HEAD"]).split(/\r?\n/).filter(Boolean);
    for (const file of later) if (!file.startsWith(`${prefix}/evidence/`)) failures.push(`commit after sourceSha changes non-evidence file ${file}`);
  } catch { failures.push("sourceSha must be an ancestor containing the focused router change"); }
  return failures;
}

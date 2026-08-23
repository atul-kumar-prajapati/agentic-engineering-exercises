import crypto from "node:crypto";
import path from "node:path";
import { execFileSync } from "node:child_process";

export const hash = (value) => crypto.createHash("sha256").update(Buffer.isBuffer(value) ? value : String(value).replaceAll("\r\n", "\n")).digest("hex");
const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
const round = (value) => Number(value.toFixed(10));
const nextTier = { fast: "balanced", balanced: "reasoning", reasoning: "reasoning" };

export function buildRoutingScorecard({ cases, pricing, pack, measurements, metadata, decisions, packText }) {
  const failures = [];
  const expectedKeys = cases.flatMap((item) => item.eligibleTiers.flatMap((tier) => [1, 2, 3].map((run) => `${item.id}:${tier}:${run}`)));
  if (pack?.schemaVersion !== 1 || pack?.packId !== "routing-measurements-v1" || pack?.scorerVersion !== 1 || pack?.sourceKind !== "deterministic-benchmark-fixture" || !Array.isArray(pack?.runs)) failures.push("benchmark pack identity is invalid");
  if (!String(pack?.provenance?.generation ?? "").includes("synthetic") || !String(pack?.provenance?.limitations ?? "").includes("not production-provider telemetry")) failures.push("benchmark pack provenance and limitations must be explicit");
  const runByKey = new Map();
  for (const run of pack?.runs ?? []) {
    if (runByKey.has(run.sampleKey)) failures.push(`duplicate recorded run ${run.sampleKey}`);
    runByKey.set(run.sampleKey, run);
    const [caseId, tier, runNumber] = String(run.sampleKey).split(":");
    if (!expectedKeys.includes(run.sampleKey) || run.caseId !== caseId || run.tier !== tier || run.run !== Number(runNumber)) failures.push(`recorded run fields do not match sampleKey: ${run.sampleKey}`);
    if (typeof run.response !== "string" || run.response.length < 80 || run.responseSha256 !== hash(run.response)) failures.push(`benchmark response or hash is invalid: ${run.sampleKey}`);
    if (!Number.isInteger(run.inputTokens) || run.inputTokens <= 0 || !Number.isInteger(run.outputTokens) || run.outputTokens <= 0) failures.push(`recorded token counts are invalid: ${run.sampleKey}`);
    if (!(run.latencyMs > 0) || !(run.qualityScore >= 0 && run.qualityScore <= 1) || typeof run.safetyPassed !== "boolean") failures.push(`recorded latency, quality, or safety is invalid: ${run.sampleKey}`);
    if (typeof run.gradingRationale !== "string" || run.gradingRationale.length < 50) failures.push(`recorded grading rationale is too short: ${run.sampleKey}`);
  }
  const safetyStates = new Set((pack?.runs ?? []).map((run) => run.safetyPassed));
  if (!safetyStates.has(true) || !safetyStates.has(false)) failures.push("benchmark pack must exercise both passing and failing safety observations");
  if (new Set((pack?.runs ?? []).map((run) => run.gradingRationale)).size < 12) failures.push("benchmark grading rationales are not case-specific enough");
  if (JSON.stringify([...runByKey.keys()].sort()) !== JSON.stringify([...expectedKeys].sort())) failures.push("recorded pack must contain exactly 36 eligible case, tier, and run combinations");

  if (metadata?.schemaVersion !== 1 || metadata?.packId !== pack?.packId || metadata?.runsPerLane !== 3 || metadata?.scorerVersion !== 1) failures.push("measurement metadata is invalid");
  if (metadata?.packSha256 !== hash(packText)) failures.push("measurement metadata does not match the protected recorded pack");
  if (!/^[a-f0-9]{40}$/.test(metadata?.sourceSha ?? "")) failures.push("sourceSha must be a full commit SHA");

  const rates = pricing.perMillionTokens;
  const callCost = (run) => round((run.inputTokens * rates[run.tier].input + run.outputTokens * rates[run.tier].output) / 1_000_000);
  const measurementByKey = new Map();
  if (!Array.isArray(measurements) || measurements.length !== expectedKeys.length) failures.push(`routing measurements must contain exactly ${expectedKeys.length} entries`);
  for (const measurement of measurements ?? []) {
    if (measurementByKey.has(measurement.sampleKey)) failures.push(`duplicate measurement ${measurement.sampleKey}`);
    measurementByKey.set(measurement.sampleKey, measurement);
    const run = runByKey.get(measurement.sampleKey);
    if (!run) continue;
    for (const field of ["inputTokens", "outputTokens", "latencyMs", "qualityScore", "safetyPassed", "responseSha256"]) if (measurement[field] !== run[field]) failures.push(`${measurement.sampleKey} measurement changed ${field}`);
    if (measurement.callCostUsd !== callCost(run)) failures.push(`${measurement.sampleKey} call cost does not reconcile to protected tokens and pricing`);
  }
  for (const key of expectedKeys) if (!measurementByKey.has(key)) failures.push(`missing measurement ${key}`);

  const decisionMap = new Map((decisions ?? []).map((entry) => [entry.id, entry.route]));
  if (decisionMap.size !== cases.length) failures.push("routing decisions must cover every case exactly once");
  for (const item of cases) if (decisionMap.get(item.id) !== item.expectedRoute) failures.push(`incorrect route for ${item.id}`);

  const caseResults = [];
  for (const item of cases) {
    const route = decisionMap.get(item.id);
    if (route === "clarify") {
      caseResults.push({ id: item.id, route, firstCallCost: 0, expectedAddedCost: 0, totalExpectedCost: 0, expectedLatencyMs: 0, qualityMean: null, qualityRange: null, safetyFailures: 0, failureProbability: 0, escalationRoute: null });
      continue;
    }
    const selected = [1, 2, 3].map((run) => runByKey.get(`${item.id}:${route}:${run}`));
    const escalationRoute = nextTier[route];
    const escalated = [1, 2, 3].map((run) => runByKey.get(`${item.id}:${escalationRoute}:${run}`));
    const failed = selected.filter((run) => run.qualityScore < item.qualityFloor || !run.safetyPassed).length;
    const failureProbability = failed / 3;
    const qualities = selected.map((run) => run.qualityScore);
    const firstCallCost = mean(selected.map(callCost));
    // Retry run N is paired with first-call run N. This preserves the real
    // correlation between a failed attempt and the cost/latency of its retry.
    const addedCosts = selected.map((run, index) =>
      run.qualityScore < item.qualityFloor || !run.safetyPassed ? callCost(escalated[index]) : 0,
    );
    const totalLatencies = selected.map((run, index) =>
      run.latencyMs + (run.qualityScore < item.qualityFloor || !run.safetyPassed ? escalated[index].latencyMs : 0),
    );
    const expectedAddedCost = mean(addedCosts);
    caseResults.push({
      id: item.id, route, firstCallCost: round(firstCallCost), expectedAddedCost: round(expectedAddedCost),
      totalExpectedCost: round(firstCallCost + expectedAddedCost), expectedLatencyMs: round(mean(totalLatencies)),
      qualityMean: round(mean(qualities)), qualityRange: round(Math.max(...qualities) - Math.min(...qualities)),
      safetyFailures: selected.filter((run) => !run.safetyPassed).length, failureProbability: round(failureProbability), escalationRoute,
    });
  }
  const executable = cases.filter((item) => item.expectedRoute !== "clarify");
  let baseline = 0;
  for (const item of executable) {
    const reasoning = [1, 2, 3].map((run) => runByKey.get(`${item.id}:reasoning:${run}`));
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
  return { failures: [...new Set(failures)], scorecard: { schemaVersion: 1, packId: pack?.packId, currency: pricing.currency, cases: caseResults, totals: { policyExpectedCost: round(policy), allReasoningExpectedCost: round(baseline), savingsPercent: round(savingsPercent) }, gates, adoption: Object.values(gates).every(Boolean) ? "adopt" : "reject" } };
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

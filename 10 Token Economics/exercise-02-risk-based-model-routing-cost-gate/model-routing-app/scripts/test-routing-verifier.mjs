import assert from "node:assert/strict";
import { buildRoutingScorecard, hash } from "./routing-verification.mjs";

const cases = [
  { id: "low", expectedRoute: "fast", eligibleTiers: ["fast", "balanced", "reasoning"], qualityFloor: 0.8 },
  { id: "medium", expectedRoute: "balanced", eligibleTiers: ["balanced", "reasoning"], qualityFloor: 0.8 },
  { id: "high", expectedRoute: "reasoning", eligibleTiers: ["reasoning"], qualityFloor: 0.8, safetyCritical: true },
  { id: "unknown", expectedRoute: "clarify", eligibleTiers: [], qualityFloor: 1 },
];
const pricing = { currency: "USD", perMillionTokens: { fast: { input: 1, output: 2 }, balanced: { input: 3, output: 6 }, reasoning: { input: 10, output: 20 } }, minimumSavingsPercent: 25 };
const runs = [];
for (const item of cases) for (const tier of item.eligibleTiers) for (const run of [1, 2, 3]) {
  const sampleKey = `${item.id}:${tier}:${run}`;
  const response = `This recorded response for ${sampleKey} contains a sufficiently detailed solution, verification evidence, risk assessment, and safety decision.`;
  const safetyPassed = sampleKey !== "low:balanced:1";
  runs.push({ sampleKey, caseId: item.id, tier, run, response, responseSha256: hash(response), inputTokens: 1000, outputTokens: 500, latencyMs: tier === "reasoning" ? 3000 : tier === "balanced" ? 1500 : 700, qualityScore: 1, safetyPassed, gradingRationale: `Offline benchmark grader for ${sampleKey} records quality 1 and safety ${safetyPassed ? "passed" : "failed"}; this case-specific synthetic observation is fixed for reproducible scoring.` });
}
const pack = {
  schemaVersion: 1,
  packId: "routing-measurements-v1",
  scorerVersion: 1,
  sourceKind: "deterministic-benchmark-fixture",
  provenance: {
    generation: "Curated synthetic observations for an offline verifier",
    limitations: "These values are reproducible benchmark inputs, not production-provider telemetry",
  },
  runs,
};
const packText = JSON.stringify(pack);
const measurements = runs.map((run) => ({ sampleKey: run.sampleKey, inputTokens: run.inputTokens, outputTokens: run.outputTokens, latencyMs: run.latencyMs, qualityScore: run.qualityScore, safetyPassed: run.safetyPassed, responseSha256: run.responseSha256, callCostUsd: Number(((run.inputTokens * pricing.perMillionTokens[run.tier].input + run.outputTokens * pricing.perMillionTokens[run.tier].output) / 1_000_000).toFixed(10)) }));
const metadata = { schemaVersion: 1, packId: pack.packId, packSha256: hash(packText), runsPerLane: 3, scorerVersion: 1, sourceSha: "a".repeat(40) };
const decisions = cases.map((item) => ({ id: item.id, route: item.expectedRoute }));
const valid = buildRoutingScorecard({ cases, pricing, pack, measurements, metadata, decisions, packText });
assert.deepEqual(valid.failures, []);
assert.equal(valid.scorecard.adoption, "adopt");
// A failed first run must use the cost and latency of its matching retry run,
// not an average retry multiplied by an average failure rate.
const pairedPack = structuredClone(pack);
const lowFast = pairedPack.runs.filter((run) => run.caseId === "low" && run.tier === "fast");
const lowBalanced = pairedPack.runs.filter((run) => run.caseId === "low" && run.tier === "balanced");
lowFast[0].qualityScore = 0;
lowBalanced[0].inputTokens = 9000;
lowBalanced[0].outputTokens = 4500;
lowBalanced[0].latencyMs = 9000;
const pairedText = JSON.stringify(pairedPack);
const pairedMeasurements = pairedPack.runs.map((run) => ({ sampleKey: run.sampleKey, inputTokens: run.inputTokens, outputTokens: run.outputTokens, latencyMs: run.latencyMs, qualityScore: run.qualityScore, safetyPassed: run.safetyPassed, responseSha256: run.responseSha256, callCostUsd: Number(((run.inputTokens * pricing.perMillionTokens[run.tier].input + run.outputTokens * pricing.perMillionTokens[run.tier].output) / 1_000_000).toFixed(10)) }));
const pairedMetadata = { ...metadata, packSha256: hash(pairedText) };
const paired = buildRoutingScorecard({ cases, pricing, pack: pairedPack, measurements: pairedMeasurements, metadata: pairedMetadata, decisions, packText: pairedText });
const lowResult = paired.scorecard.cases.find((item) => item.id === "low");
assert.equal(lowResult.expectedAddedCost, 0.018);
assert.equal(lowResult.expectedLatencyMs, 3700);
const tampered = structuredClone(measurements);
tampered[0].callCostUsd = 0;
assert.ok(buildRoutingScorecard({ cases, pricing, pack, measurements: tampered, metadata, decisions, packText }).failures.some((failure) => failure.includes("reconcile")));
console.log("offline routing cost verifier self-test passed");

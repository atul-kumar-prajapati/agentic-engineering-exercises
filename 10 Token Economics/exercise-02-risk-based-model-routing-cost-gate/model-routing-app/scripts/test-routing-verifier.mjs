import assert from "node:assert/strict";
import crypto from "node:crypto";
import { buildRoutingScorecard } from "./routing-verification.mjs";

const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const cases = [
  { id: "low", expectedRoute: "fast", eligibleTiers: ["fast", "balanced", "reasoning"], qualityFloor: 0.8 },
  { id: "medium", expectedRoute: "balanced", eligibleTiers: ["balanced", "reasoning"], qualityFloor: 0.8 },
  { id: "high", expectedRoute: "reasoning", eligibleTiers: ["reasoning"], qualityFloor: 0.8, safetyCritical: true },
  { id: "unknown", expectedRoute: "clarify", eligibleTiers: [], qualityFloor: 1 },
];
const pricing = { currency: "USD", perMillionTokens: { fast: { input: 1, output: 2 }, balanced: { input: 3, output: 6 }, reasoning: { input: 10, output: 20 } }, minimumSavingsPercent: 25 };
const metadata = { schemaVersion: 1, providerFamily: "openai:chat", models: { fast: "fast-model", balanced: "balanced-model", reasoning: "reasoning-model" }, runsPerLane: 3, temperature: 0, cacheDisabled: true, sourceSha: "a".repeat(40) };
const responses = {};
const runs = [];
for (const item of cases) for (const tier of item.eligibleTiers) for (const run of [1, 2, 3]) {
  const sampleKey = `${item.id}:${tier}:${run}`;
  const response = `This is a sufficiently detailed measured response for ${sampleKey}, including a correct solution, verification evidence, risks, and safety considerations.`;
  responses[sampleKey] = response;
  runs.push({ sampleKey, caseId: item.id, tier, run, provider: metadata.providerFamily, model: metadata.models[tier], responseSha256: hash(response), inputTokens: 1000, outputTokens: 500, latencyMs: tier === "reasoning" ? 3000 : tier === "balanced" ? 1500 : 700, qualityScore: 1, safetyPassed: true, gradingRationale: "The measured answer satisfies every protected assertion and contains the required verification and safety evidence." });
}
const decisions = cases.map((item) => ({ id: item.id, route: item.expectedRoute }));
const valid = buildRoutingScorecard({ cases, pricing, runs, responses, metadata, decisions });
assert.deepEqual(valid.failures, []);
assert.equal(valid.scorecard.adoption, "adopt");
const tampered = structuredClone(runs);
tampered[0].responseSha256 = "0".repeat(64);
assert.ok(buildRoutingScorecard({ cases, pricing, runs: tampered, responses, metadata, decisions }).failures.some((failure) => failure.includes("hash mismatch")));
console.log("routing cost verifier self-test passed");

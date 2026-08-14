import assert from "node:assert/strict";
import crypto from "node:crypto";
import { buildScorecard } from "./review-eval-verification.mjs";

const hash = (value) => crypto.createHash("sha256").update(value.replaceAll("\r\n", "\n")).digest("hex");
const cases = [
  { id: "historical-regression", kind: "historical-bad", expectedFindingIds: ["H1", "H2", "H3", "H4", "H5"] },
  { id: "security-regression", kind: "multi-bug", expectedFindingIds: ["M1", "M2"] },
  { id: "clean-control", kind: "clean-control", expectedFindingIds: [] },
];
const baselinePrompt = "baseline prompt";
const candidatePrompt = "candidate prompt";
const results = [];
const judgments = [];
for (const promptLabel of ["baseline", "candidate"]) {
  for (const item of cases) {
    for (const sample of [1, 2, 3]) {
      const output = `Concrete review response for ${promptLabel} ${item.id} sample ${sample}. It explains observable behavior, severity, evidence, and a verification scenario in sufficient detail.`;
      const sampleKey = `${promptLabel}:${item.id}:${sample}`;
      results.push({ prompt: { label: promptLabel }, provider: { id: "openai:chat:test-model" }, response: { output }, latencyMs: 100, success: true, metadata: { caseId: item.id, sample } });
      judgments.push({ sampleKey, responseSha256: hash(output), foundFindingIds: [...item.expectedFindingIds], falseBlocker: false, reviewer: "QA reviewer", rationale: "The response states the expected observable failure and supports it with a concrete scenario rather than checklist wording.", disputed: false });
    }
  }
}
const rawDocument = { results: { results } };
const rawText = JSON.stringify(rawDocument);
const run = { schemaVersion: 1, provider: "openai:chat:test-model", temperature: 0, sampleCountPerPromptCase: 3, cacheDisabled: true, rawResultsSha256: hash(rawText), baselinePromptSha256: hash(baselinePrompt), candidatePromptSha256: hash(candidatePrompt), candidatePromptSourceSha: "a".repeat(40) };
const valid = buildScorecard({ rawDocument, rawText, judgments, cases, run, baselinePrompt, candidatePrompt });
assert.deepEqual(valid.failures, []);
assert.equal(valid.scorecard.adoption, "adopt");
const tampered = structuredClone(judgments);
tampered[0].responseSha256 = "0".repeat(64);
assert.ok(buildScorecard({ rawDocument, rawText, judgments: tampered, cases, run, baselinePrompt, candidatePrompt }).failures.some((failure) => failure.includes("hash mismatch")));
const synthetic = structuredClone(rawDocument);
synthetic.results.results[0].provider.id = "file://answers.json";
assert.ok(buildScorecard({ rawDocument: synthetic, rawText: JSON.stringify(synthetic), judgments, cases, run, baselinePrompt, candidatePrompt }).failures.some((failure) => failure.includes("remote model")));
console.log("review regression scorer self-test passed");

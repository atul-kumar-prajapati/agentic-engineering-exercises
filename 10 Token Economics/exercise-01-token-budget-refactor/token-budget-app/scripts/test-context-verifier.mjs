import assert from "node:assert/strict";
import { verifyContextEvidence } from "./context-verification.mjs";

const catalog = [
  { id: "repository-rules", bytes: 10 },
  { id: "contract", bytes: 20 },
];
const plan = { schemaVersion: 1, task: { tags: ["adapter"], questionTags: [] }, openQuestions: ["Which adapter contract is current?"], maximumBytes: 40, mandatoryIds: ["repository-rules"], expectedSelectedIds: ["repository-rules", "contract"] };
const result = { selected: [{ id: "repository-rules", bytes: 10, reason: "mandatory" }, { id: "contract", bytes: 20, reason: "relevant" }], skipped: [], totalBytes: 30, remainingBytes: 10, maximumBytes: 40, requestedTags: ["adapter"], unresolvedTags: [] };
const ledger = { schemaVersion: 1, task: plan.task, maximumBytes: 40, planSha: "a".repeat(40), sourceSha: "b".repeat(40), result };
assert.deepEqual(verifyContextEvidence({ plan, ledger, catalog, expectedResult: result }), []);
const tampered = structuredClone(ledger);
tampered.result.totalBytes = 12;
assert.ok(verifyContextEvidence({ plan, ledger: tampered, catalog, expectedResult: result }).some((failure) => failure.includes("totalBytes")));
console.log("context evidence verifier self-test passed");

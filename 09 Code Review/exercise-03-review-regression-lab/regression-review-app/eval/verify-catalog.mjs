import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const cases = JSON.parse(await readFile(new URL("./cases.json", import.meta.url), "utf8"));
const candidate = await readFile(new URL("./review-prompt-candidate.md", import.meta.url), "utf8");
assert.deepEqual(cases.map((item) => item.expectedFindingIds.length), [5, 2, 0]);
assert.equal(new Set(cases.map((item) => item.id)).size, 3);
assert.ok(candidate.trim().length >= 180 && candidate.trim().length <= 1400, "Candidate prompt must be 180-1400 characters");
for (const phrase of ["HIST-", "MULTI-", "startsWith", "JSON.parse", "authorization bypass", "slice(0", "Blocked summary"]) {
  assert.ok(!candidate.toLowerCase().includes(phrase.toLowerCase()), `Candidate prompt encodes expected finding: ${phrase}`);
}
console.log("PASS protected catalog contains five-bug, two-bug, and clean-control cases");
console.log("PASS candidate prompt length and answer-leak checks");
console.log("PASS reviewer receives neutral acceptance context rather than case IDs or kinds");

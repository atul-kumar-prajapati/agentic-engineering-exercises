import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { selectContext } from "../src/budget/selectContext.mjs";

const exerciseRoot = path.resolve(import.meta.dirname, "..", "..");
const catalog = JSON.parse(fs.readFileSync(path.join(exerciseRoot, "docs", "context-catalog.json"), "utf8"));
const ids = (result) => result.selected.map((item) => item.id);

for (const item of catalog) {
  const actual = fs.readFileSync(path.join(exerciseRoot, item.path)).byteLength;
  assert.equal(item.bytes, actual, `${item.id} catalog cost must equal real UTF-8 bytes`);
}

const initial = selectContext(catalog, { tags: ["session", "adapter"] }, 1700);
assert.deepEqual(ids(initial), ["repository-rules", "current-adapter-contract"]);
assert.equal(initial.totalBytes, 1136);
assert.equal(initial.remainingBytes, 564);
assert.ok(!ids(initial).includes("legacy-migration-notes"), "stale source must never displace current authority");
assert.equal(initial.skipped.find((item) => item.id === "ui-style-guide")?.reason, "irrelevant");

const expanded = selectContext(catalog, { tags: ["session", "adapter"], questions: ["errors"] }, 1700);
assert.deepEqual(ids(expanded), ["repository-rules", "current-adapter-contract", "current-error-contract"]);
assert.equal(expanded.totalBytes, 1562);

const tight = selectContext(catalog, { tags: ["session", "adapter"] }, 1000);
assert.deepEqual(ids(tight), ["repository-rules"]);
assert.equal(tight.skipped.find((item) => item.id === "current-adapter-contract")?.reason, "budget");
assert.deepEqual(tight.unresolvedTags, ["adapter", "session"]);

const reversed = selectContext([...catalog].reverse(), { tags: ["adapter", "session"], questions: ["errors"] }, 1700);
assert.deepEqual(reversed, expanded, "selection must not depend on catalog order");
assert.throws(() => selectContext(catalog, { tags: ["adapter"] }, 488), /mandatory context/i);
assert.throws(() => selectContext([...catalog, catalog[0]], { tags: [] }, 1700), /duplicate context id/i);
assert.throws(() => selectContext(catalog, { tags: [] }, 0), /positive integer/i);
assert.equal(new Set([...initial.selected, ...initial.skipped].map((item) => item.id)).size, catalog.length);
assert.equal(initial.totalBytes, initial.selected.reduce((total, item) => total + item.bytes, 0));

console.log("PASS real UTF-8 source costs match the protected catalog");
console.log("PASS mandatory, current, relevant, priority, and expansion rules");
console.log("PASS deterministic tight-budget and mandatory-overflow behavior");
console.log("PASS every source has an auditable selected or skipped reason");

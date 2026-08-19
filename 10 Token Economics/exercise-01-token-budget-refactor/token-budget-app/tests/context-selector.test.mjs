import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { selectContext } from "../src/budget/selectContext.mjs";

const exerciseRoot = path.resolve(import.meta.dirname, "..", "..");
const catalog = JSON.parse(fs.readFileSync(path.join(exerciseRoot, "docs", "context-catalog.json"), "utf8"));
const ids = (result) => result.selected.map((item) => item.id);
const skipReason = (result, id) => result.skipped.find((item) => item.id === id)?.reason;

const adapterTask = { tags: ["session", "adapter"] };
const expandedTask = { tags: ["session", "adapter"], questions: ["errors"] };

const initial = selectContext(catalog, adapterTask, 1700);
assert.deepEqual(ids(initial), ["repository-rules", "current-adapter-contract"]);
assert.equal(initial.selected[0].reason, "mandatory");
assert.equal(initial.selected[1].reason, "relevant");
assert.equal(initial.totalBytes, 489 + 647);
assert.equal(initial.remainingBytes, 1700 - initial.totalBytes);
assert.deepEqual(initial.requestedTags, ["adapter", "session"]);
assert.deepEqual(initial.unresolvedTags, []);
assert.equal(skipReason(initial, "legacy-migration-notes"), "stale");
assert.equal(skipReason(initial, "current-error-contract"), "irrelevant");
assert.equal(skipReason(initial, "audit-retention"), "irrelevant");

const shuffled = selectContext([...catalog].reverse(), { tags: ["adapter", "session"] }, 1700);
assert.deepEqual(shuffled, initial, "deterministic selection must ignore catalog and tag order");

const expanded = selectContext(catalog, expandedTask, 1700);
assert.deepEqual(ids(expanded), ["repository-rules", "current-adapter-contract", "current-error-contract"]);
assert.equal(expanded.totalBytes, 1562);
assert.equal(expanded.selected[2].reason, "relevant");
assert.ok(!ids(expanded).includes("legacy-migration-notes"));
assert.equal(skipReason(expanded, "ui-style-guide"), "irrelevant");
assert.deepEqual(expanded.requestedTags, ["adapter", "errors", "session"]);

const questionOnly = selectContext(catalog, { tags: [], questions: ["errors"] }, 1700);
assert.deepEqual(ids(questionOnly), ["repository-rules", "current-error-contract"]);
assert.equal(questionOnly.totalBytes, 489 + 426, "question-driven expansion selects the error contract without adapter tags");

const tight = selectContext(catalog, adapterTask, 1000);
assert.deepEqual(ids(tight), ["repository-rules"]);
assert.equal(skipReason(tight, "current-adapter-contract"), "budget");
assert.deepEqual(tight.unresolvedTags, ["adapter", "session"]);

const almostExpanded = selectContext(catalog, expandedTask, 1500);
assert.deepEqual(ids(almostExpanded), ["repository-rules", "current-adapter-contract"]);
assert.equal(skipReason(almostExpanded, "current-error-contract"), "budget");

assert.throws(() => selectContext(catalog, adapterTask, 488), /mandatory context/i);
assert.throws(() => selectContext([...catalog, catalog[3]], adapterTask, 1700), /duplicate context id/i);
assert.throws(() => selectContext(catalog, adapterTask, -1), /positive integer/i);
assert.throws(() => selectContext(catalog, adapterTask, 12.5), /positive integer/i);

assert.equal(new Set([...expanded.selected, ...expanded.skipped].map((item) => item.id)).size, catalog.length);
assert.equal(
  expanded.totalBytes,
  expanded.selected.reduce((total, item) => total + item.bytes, 0),
  "byte totals must equal the sum of selected UTF-8 costs",
);
assert.ok(expanded.skipped.every((item) => typeof item.reason === "string" && item.reason.length > 0));

console.log("PASS learner tests: deterministic ordering, budget, stale skip, duplicate ids, question expansion");

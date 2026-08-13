import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { selectContext } from "../src/budget/selectContext.mjs";

const catalog = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, "..", "..", "docs", "context-catalog.json"), "utf8"));
const selected = selectContext(catalog, { tags: ["adapter", "session"] }, 3600);
const ids = selected.selected.map((item) => item.id);
assert.ok(ids.includes("repository-rules"), "mandatory repository rules must always be selected");
assert.ok(ids.includes("current-adapter-contract"), "current task-relevant contract must be selected");
assert.ok(!ids.includes("legacy-migration-notes"), "stale source must not displace current context");
assert.ok(!ids.includes("ui-style-guide"), "irrelevant UI context must not be selected");
assert.ok(selected.totalBytes <= 3600, "selected context exceeds the task budget");
assert.equal(selected.totalBytes, selected.selected.reduce((total, item) => total + item.bytes, 0), "reported bytes must equal selected bytes");
console.log("Context selection preserves mandatory and relevant current sources within budget.");

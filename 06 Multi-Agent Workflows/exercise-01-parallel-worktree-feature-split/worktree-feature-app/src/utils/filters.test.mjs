import assert from "node:assert/strict";
import test from "node:test";
import {
  applyPreset,
  filterItems,
  HIGH_PRIORITY_BLOCKED_PRESET,
  isPresetActive,
} from "./filters.ts";

const items = [
  {
    id: "matching",
    name: "Atlas Co",
    priority: "High",
    status: "Blocked",
    score: 91,
    summary: "Needs review",
    note: "Security exception pending",
    owner: "Asha",
    dueInDays: 0,
    tags: ["customer-visible"],
  },
  {
    id: "wrong-query",
    name: "Granite Ops",
    priority: "High",
    status: "Blocked",
    score: 94,
    summary: "Data conflict",
    note: "Requires rollback plan",
    owner: "Rina",
    dueInDays: 1,
    tags: ["internal"],
  },
  {
    id: "wrong-status",
    name: "Atlas Escalation",
    priority: "High",
    status: "Escalated",
    score: 88,
    summary: "Policy mismatch",
    note: "Legal review requested",
    owner: "Nikhil",
    dueInDays: 3,
    tags: ["customer-visible"],
  },
];

test("the High-priority Blocked preset preserves search and uses normal filtering", () => {
  const current = { query: "atlas", priority: "All", status: "All" };
  const applied = applyPreset(current, HIGH_PRIORITY_BLOCKED_PRESET);

  assert.deepEqual(applied, { query: "atlas", priority: "High", status: "Blocked" });
  assert.equal(isPresetActive(applied, HIGH_PRIORITY_BLOCKED_PRESET), true);
  assert.deepEqual(
    filterItems(items, applied).map((item) => item.id),
    ["matching"],
  );
});

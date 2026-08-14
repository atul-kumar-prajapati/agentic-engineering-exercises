import assert from "node:assert/strict";
import test from "node:test";

import { calculateRisk, riskLabel, summarizePortfolio } from "./scoring.ts";

function makeWorkItem(overrides = {}) {
  return {
    id: "work-1",
    name: "Example",
    priority: "Low",
    status: "Ready",
    score: 10,
    summary: "Summary",
    note: "Note",
    owner: "Owner",
    dueInDays: 4,
    tags: [],
    ...overrides,
  };
}

test("blocked work due today is always critical", () => {
  const score = calculateRisk(makeWorkItem({ status: "Blocked", dueInDays: 0, score: 0 }));

  assert.equal(score, 90);
  assert.equal(riskLabel(score), "Critical");
});

test("portfolio summary reports work due today separately", () => {
  const summary = summarizePortfolio([
    makeWorkItem({ id: "due-today", dueInDays: 0 }),
    makeWorkItem({ id: "due-later", dueInDays: 1 }),
  ]);

  assert.equal(summary.dueToday, 1);
});

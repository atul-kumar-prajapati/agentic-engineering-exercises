import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { routeTask } from "../src/routing/routeTask.mjs";
import { dispatchTasks } from "../src/routing/dispatchTasks.mjs";

const cases = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, "..", "..", "evals", "routing-cases.json"), "utf8"));
for (const task of cases) {
  assert.equal(routeTask({ ...task, id: `renamed-${task.id}` }), task.expectedRoute, `field-based route failed for ${task.id}`);
  console.log(`PASS ${task.id} -> ${task.expectedRoute}`);
}
for (const [task, expected] of [
  [{ ambiguity: "low", scope: "one-file" }, "clarify"],
  [{ risk: "low", ambiguity: "low" }, "clarify"],
  [{ risk: "low", ambiguity: "high", scope: "one-file" }, "clarify"],
  [{ risk: "low", ambiguity: "medium", scope: "one-file" }, "clarify"],
  [{ risk: "unknown", ambiguity: "low", scope: "one-file" }, "clarify"],
  [{ risk: "low", ambiguity: "low", scope: "unknown" }, "clarify"],
  [{ risk: "low", ambiguity: "low", scope: "six-files" }, "clarify"],
  [{ risk: "urgent", ambiguity: "low", scope: "one-file" }, "clarify"],
  [{ risk: "high", ambiguity: "low", scope: "one-file" }, "reasoning"],
  [{ risk: "high", ambiguity: "low", scope: "mechanical" }, "reasoning"],
  [{ risk: "medium", ambiguity: "low", scope: "one-file" }, "balanced"],
  [{ risk: "medium", ambiguity: "low", scope: "cross-boundary" }, "reasoning"],
  [{ risk: "low", ambiguity: "low", scope: "cross-boundary" }, "reasoning"],
  [{ risk: "low", ambiguity: "low", scope: "mechanical" }, "fast"],
]) assert.equal(routeTask(task), expected);
console.log("PASS held-out missing, invalid, precedence, risk, ambiguity, and scope permutations");

const calls = [];
const dispatched = await dispatchTasks([
  { id: "safe", risk: "low", ambiguity: "low", scope: "one-file" },
  { id: "unclear", risk: "unknown", ambiguity: "high", scope: "unknown" },
], {
  execute: async (tier, task) => { calls.push(`execute:${tier}:${task.id}`); return "executed"; },
  clarify: async (task) => { calls.push(`clarify:${task.id}`); return "question-requested"; },
});
assert.deepEqual(dispatched.map((item) => item.route), ["fast", "clarify"]);
assert.deepEqual(calls, ["execute:fast:safe", "clarify:unclear"]);
console.log("PASS application dispatch consumer uses the field-based routing decision");

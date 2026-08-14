import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { routeTask } from "../src/routing/routeTask.mjs";

const cases = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, "..", "..", "evals", "routing-cases.json"), "utf8"));
for (const task of cases) {
  assert.equal(routeTask({ ...task, id: `renamed-${task.id}` }), task.expectedRoute, `field-based route failed for ${task.id}`);
  console.log(`PASS ${task.id} -> ${task.expectedRoute}`);
}
for (const [task, expected] of [
  [{ risk: "low", ambiguity: "high", scope: "one-file" }, "clarify"],
  [{ risk: "unknown", ambiguity: "low", scope: "one-file" }, "clarify"],
  [{ risk: "high", ambiguity: "low", scope: "one-file" }, "reasoning"],
  [{ risk: "medium", ambiguity: "low", scope: "one-file" }, "balanced"],
  [{ risk: "low", ambiguity: "low", scope: "cross-boundary" }, "reasoning"],
  [{ risk: "low", ambiguity: "low", scope: "mechanical" }, "fast"],
]) assert.equal(routeTask(task), expected);
console.log("PASS held-out risk, ambiguity, and scope permutations");

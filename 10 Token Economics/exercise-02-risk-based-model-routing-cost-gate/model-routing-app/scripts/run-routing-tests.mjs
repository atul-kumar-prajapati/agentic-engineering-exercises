import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { routeTask } from "../src/routing/routeTask.mjs";

const cases = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, "..", "..", "evals", "routing-cases.json"), "utf8"));
let failed = 0;
for (const task of cases) {
  try { assert.equal(routeTask(task), task.expectedRoute); console.log(`PASS ${task.id}`); }
  catch (error) { failed += 1; console.error(`FAIL ${task.id}: ${error.message}`); }
}
if (failed) process.exit(1);

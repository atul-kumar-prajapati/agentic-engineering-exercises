import assert from "node:assert/strict";
import fs from "node:fs";

const app = fs.readFileSync("src/App.tsx", "utf8");
const failures = [];
try { assert.ok(!app.includes("clearCachedWorkflowItems"), "filter changes must not delete persisted workflow data"); }
catch (error) { failures.push(error.message); }
if (failures.length) {
  console.error(`App cache checks failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
  process.exit(1);
}
console.log("PASS filter changes do not clear persisted workflow data");

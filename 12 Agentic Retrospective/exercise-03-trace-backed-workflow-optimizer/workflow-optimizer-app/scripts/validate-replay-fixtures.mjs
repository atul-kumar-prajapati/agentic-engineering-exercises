import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const cases = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, "..", "evals", "replay-cases.json"), "utf8"));
assert.equal(cases.length, 8, "exactly eight protected replay cases are required");
assert.equal(cases.filter((item) => item.split === "heldout").length, 2, "two cases must remain held out");
for (const item of cases) assert.ok(item.assertions.some((assertion) => assertion.critical), `${item.id} needs a critical assertion`);
console.log("Replay train, held-out, and critical assertions verified.");

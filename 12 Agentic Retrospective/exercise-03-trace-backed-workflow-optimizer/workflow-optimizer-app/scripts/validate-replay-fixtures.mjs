import assert from "node:assert/strict";
import fs from "node:fs";

const cases = JSON.parse(fs.readFileSync(new URL("../evals/replay-cases.json", import.meta.url), "utf8"));
assert.equal(cases.length, 8, "exactly eight protected replay cases are required");
assert.equal(new Set(cases.map((item) => item.id)).size, 8, "case IDs must be unique");
assert.equal(cases.filter((item) => item.split === "train").length, 6, "six cases must train the change");
assert.equal(cases.filter((item) => item.split === "heldout").length, 2, "two cases must remain held out");
for (const item of cases) {
  assert.ok(item.request.length >= 30, `${item.id} needs a substantive request`);
  assert.ok(item.assertions.some((assertion) => assertion.critical), `${item.id} needs a critical assertion`);
  assert.equal(new Set(item.assertions.map((assertion) => assertion.id)).size, item.assertions.length, `${item.id} assertion IDs must be unique`);
}
console.log("PASS 6 train, 2 held-out, unique requests, and critical assertions");

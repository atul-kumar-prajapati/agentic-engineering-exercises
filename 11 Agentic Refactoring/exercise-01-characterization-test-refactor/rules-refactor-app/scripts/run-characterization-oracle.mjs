import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { evaluateRenewalEligibility } from "../src/rules/legacyEligibility.mjs";
const cases = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, "..", "..", "docs", "renewal-golden-cases.json"), "utf8"));
for (const item of cases) {
  assert.deepEqual(evaluateRenewalEligibility(item.input), item.expected, item.name);
  console.log(`PASS ${item.name}`);
}

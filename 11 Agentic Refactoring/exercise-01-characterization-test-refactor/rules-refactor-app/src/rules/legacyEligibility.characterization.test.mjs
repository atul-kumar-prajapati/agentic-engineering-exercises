import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { evaluateRenewalEligibility } from "./legacyEligibility.mjs";

// Characterization test: pins the observed public behavior of the legacy
// renewal rule before any structural refactor. Every case below is an
// observation loaded from docs/renewal-golden-cases.json, including the
// surprising ones — support override precedence, negative late-payment
// counts accepted, and plan-not-supported on otherwise mature accounts.
// The test exercises only the public export evaluateRenewalEligibility
// and asserts deep equality of the complete result objects, so status,
// discountPercent, and the exact reason strings are all pinned. It is
// committed before any production edit so the refactor has a safety net.
const goldenCasesPath = path.resolve(import.meta.dirname, "..", "..", "..", "docs", "renewal-golden-cases.json");
const cases = JSON.parse(fs.readFileSync(goldenCasesPath, "utf8"));

if (!Array.isArray(cases) || cases.length !== 10) {
  console.error(`expected 10 golden cases in renewal-golden-cases.json, found ${cases?.length}`);
  process.exit(1);
}

let failures = 0;
for (const item of cases) {
  try {
    assert.deepEqual(evaluateRenewalEligibility(item.input), item.expected);
    console.log(`PASS ${item.name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${item.name}\n${error.message}`);
  }
}

if (failures > 0) {
  console.error(`${failures} characterization observation(s) no longer match the golden baseline`);
  process.exit(1);
}
console.log(`PASS ${cases.length} characterization observations match the golden baseline`);

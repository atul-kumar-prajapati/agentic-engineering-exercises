import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { evaluateRenewalEligibility } from "../src/rules/legacyEligibility.mjs";

const cases = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, "..", "..", "docs", "renewal-golden-cases.json"), "utf8"));
const observations = cases.map((item) => ({ name: item.name, input: item.input, output: evaluateRenewalEligibility(item.input) }));
for (let index = 0; index < cases.length; index += 1) assert.deepEqual(observations[index].output, cases[index].expected, cases[index].name);
if (process.argv.includes("--json")) process.stdout.write(`${JSON.stringify(observations, null, 2)}\n`);
else {
  for (const item of observations) console.log(`PASS ${item.name}`);
  console.log(`PASS ${observations.length} protected public-behavior observations`);
}

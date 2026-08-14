import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const root = path.resolve(import.meta.dirname, "..", "..");
const cases = JSON.parse(fs.readFileSync(path.join(root, "evals", "routing-cases.json"), "utf8"));
const pricing = JSON.parse(fs.readFileSync(path.join(root, "evals", "pricing.json"), "utf8"));
assert.equal(cases.length, 8);
assert.equal(cases.filter((item) => item.expectedRoute === "clarify").length, 2);
assert.equal(cases.reduce((sum, item) => sum + item.eligibleTiers.length * 3, 0), 36);
for (const item of cases) {
  assert.ok(["fast", "balanced", "reasoning", "clarify"].includes(item.expectedRoute));
  assert.ok(item.expectedRoute === "clarify" || item.eligibleTiers.includes(item.expectedRoute));
}
for (const route of ["fast", "balanced", "reasoning"]) assert.ok(pricing.perMillionTokens[route]);
assert.equal(pricing.minimumSavingsPercent, 25);
console.log("PASS eight protected cases define 36 required measured runs");
console.log("PASS clarification, eligible tiers, quality floors, and pricing are complete");

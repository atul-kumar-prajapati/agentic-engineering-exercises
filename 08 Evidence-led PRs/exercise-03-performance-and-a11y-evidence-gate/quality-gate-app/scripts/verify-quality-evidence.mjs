import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..", "..");
const lighthousePath = path.join(root, "evidence", "lighthouse-after.json");
const a11yPath = path.join(root, "evidence", "a11y-after.json");
assert.ok(fs.existsSync(lighthousePath) && fs.existsSync(a11yPath), "missing final Lighthouse or accessibility evidence");
const lighthouse = JSON.parse(fs.readFileSync(lighthousePath, "utf8"));
const a11y = JSON.parse(fs.readFileSync(a11yPath, "utf8"));
assert.match(lighthouse.commitSha ?? "", /^[0-9a-f]{7,40}$/i, "Lighthouse evidence needs a commit SHA");
assert.equal(a11y.commitSha, lighthouse.commitSha, "browser evidence must describe the same commit");
assert.ok(lighthouse.runs >= 3, "at least three Lighthouse runs are required");
assert.ok(lighthouse.performance >= 0.9, "performance score must be at least 0.90");
assert.equal(lighthouse.accessibility, 1, "Lighthouse accessibility score must be 1.00");
assert.ok(lighthouse.largestContentfulPaintMs <= 2500, "LCP must be at most 2500 ms");
assert.equal((a11y.violations ?? []).length, 0, "automated accessibility evidence must have no violations");
console.log("Performance and accessibility evidence meets the release thresholds.");

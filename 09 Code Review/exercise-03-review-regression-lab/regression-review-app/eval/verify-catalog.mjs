import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const cases = JSON.parse(await readFile(new URL("./cases.json", import.meta.url), "utf8"));
const skill = await readFile(new URL("../skills/regression-review/SKILL.md", import.meta.url), "utf8");
assert.deepEqual(cases.map((item) => item.acceptanceRules.length), [5, 2, 1]);
assert.deepEqual(cases.map((item) => item.expectation), ["regressions", "regressions", "conforms"]);
assert.ok(cases.every((item) => !("expectedFindingIds" in item)), "catalog must not publish answer IDs");
assert.ok(cases.every((item) => !("minimumBlockingFindings" in item) && !("expectedDecision" in item)), "catalog must express acceptance rules rather than answer counts");
assert.equal(new Set(cases.map((item) => item.id)).size, 3);
assert.match(skill, /^---\s*\nname:\s*regression-review\s*\ndescription:\s*.+\n---/m, "SKILL.md needs valid name and description frontmatter");
assert.ok(skill.trim().length >= 250 && skill.trim().length <= 5000, "SKILL.md must stay concise");
for (const phrase of ["historical-regression", "security-regression", "clean-control", "HIST-", "MULTI-", "startsWith", "JSON.parse", "slice(0"]) {
  assert.ok(!skill.toLowerCase().includes(phrase.toLowerCase()), `SKILL.md encodes protected case detail: ${phrase}`);
}
console.log("PASS catalog contains two defect cases and one clean control");
console.log("PASS starter skill has valid frontmatter and contains no protected case answers");

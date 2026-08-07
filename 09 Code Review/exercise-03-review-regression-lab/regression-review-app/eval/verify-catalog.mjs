import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const cases = JSON.parse(await readFile(new URL("./cases.json", import.meta.url), "utf8"));
const candidate = await readFile(new URL("./review-prompt-candidate.md", import.meta.url), "utf8");
assert.ok(cases.some((item) => item.kind === "historical-bad"));
assert.ok(cases.some((item) => item.kind === "multi-bug"));
assert.ok(cases.some((item) => item.kind === "clean-control"));
for (const phrase of ["startsWith", "Blocked work", "JSON.parse", "authorization bypass"]) {
  assert.ok(!candidate.includes(phrase), `Candidate prompt encodes expected finding: ${phrase}`);
}
console.log(`Loaded ${cases.length} behavior cases without expected findings in the prompt.`);

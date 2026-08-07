import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const router = readFileSync(path.join(root, "src/services/caseRouter.ts"), "utf8");
const cases = readFileSync(path.join(root, "src/data/cases.ts"), "utf8");
const thresholds = [...`${router}\n${cases}`.matchAll(/staleAfterHours:\s*(\d+)/g)].map((match) => Number(match[1]));
assert.deepEqual(thresholds, [24, 24], "both staleAfterHours policy locations must be updated to 24");
const northstar = cases.match(/id: "CASE-1842"[\s\S]*?lastActivityHours:\s*(\d+)/);
assert.ok(northstar && Number(northstar[1]) >= 24, "CASE-1842 must remain representative of a stale case");
const evidence = path.resolve(root, "..", "evidence", "fresh-agent-result.md");
assert.ok(existsSync(evidence), "fresh-agent evidence/fresh-agent-result.md is required");
console.log("Fresh-agent onboarding follow-up verified.");

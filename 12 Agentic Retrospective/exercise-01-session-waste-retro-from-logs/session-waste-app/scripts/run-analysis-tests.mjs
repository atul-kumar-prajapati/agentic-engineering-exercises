import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { analyzeSession } from "../src/retro/analyzeSession.mjs";
const events = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, "..", "..", "docs", "session-events.json"), "utf8"));
assert.deepEqual(analyzeSession(events), { totalCalls: 8, duplicateReads: 3, failedRetries: 2, finalVerificationRuns: 0, preventableCalls: 5 });
console.log("Session analyzer distinguishes first attempts from duplicate reads and retries.");

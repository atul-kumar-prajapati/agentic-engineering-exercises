import assert from "node:assert/strict";
import { validateReplay } from "./retro-verification.mjs";

const metadata = { taskId: "T", agent: "A", model: "M", promptHash: "H", timeLimitMinutes: 20, sessionId: "before" };
const baseline = { preventableCalls: 4 };
const replay = { preventableCalls: 2, unchangedFailureRetries: 0, correctnessPassed: true, finalVerificationRuns: 1 };
assert.deepEqual(validateReplay({ baseline, replay, baselineMetadata: metadata, replayMetadata: { ...metadata, sessionId: "after" } }), []);
assert.ok(validateReplay({ baseline, replay: { ...replay, unchangedFailureRetries: 1 }, baselineMetadata: metadata, replayMetadata: { ...metadata, sessionId: "after" } }).length > 0);
console.log("session retrospective verifier self-test passed");

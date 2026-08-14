import assert from "node:assert/strict";
import fs from "node:fs";
import { analyzeSession } from "../src/retro/analyzeSession.mjs";

let evaluateCommandAttempt;
try {
  ({ evaluateCommandAttempt } = await import("../src/retro/preflightPolicy.mjs"));
} catch {
  throw new Error("Create src/retro/preflightPolicy.mjs and export evaluateCommandAttempt");
}

const events = JSON.parse(fs.readFileSync(new URL("../../docs/session-events.json", import.meta.url), "utf8"));
assert.deepEqual(analyzeSession(events), {
  totalEvents: 13,
  duplicateReads: 1,
  unchangedFailureRetries: 2,
  oversizedContextLoads: 1,
  preventableCalls: 4,
  finalVerificationRuns: 0,
  correctnessPassed: false,
});

const traps = [
  { sequence: 1, type: "read", target: "a.ts", contentVersion: "v1", workspaceRevision: 1, result: "ok" },
  { sequence: 2, type: "write", target: "a.ts", contentVersion: "v2", workspaceRevision: 2, result: "ok" },
  { sequence: 3, type: "read", target: "a.ts", contentVersion: "v2", workspaceRevision: 2, result: "ok" },
  { sequence: 4, type: "command", target: "npm test", workspaceRevision: 2, phase: "focused-test", result: "failed" },
  { sequence: 5, type: "diagnosis", target: "fixture missing", workspaceRevision: 2, result: "ok" },
  { sequence: 6, type: "command", target: "npm test", workspaceRevision: 2, phase: "focused-test", result: "passed" },
  { sequence: 7, type: "command", target: "npm verify", workspaceRevision: 2, phase: "final-verification", result: "passed" },
];
assert.deepEqual(analyzeSession(traps), {
  totalEvents: 7, duplicateReads: 0, unchangedFailureRetries: 0, oversizedContextLoads: 0,
  preventableCalls: 0, finalVerificationRuns: 1, correctnessPassed: true,
});
assert.throws(() => analyzeSession([{ ...traps[0] }, { ...traps[1], sequence: 1 }]), /sequence/i);
assert.throws(() => analyzeSession([{ sequence: 1, type: "context", target: "x", workspaceRevision: 1, result: "ok" }]), /bytes/i);

const failed = [{ sequence: 1, type: "command", target: "npm test", workspaceRevision: 4, phase: "focused-test", result: "failed" }];
assert.deepEqual(evaluateCommandAttempt({ command: "npm test", workspaceRevision: 4, events: failed }), { allowed: false, reason: "DIAGNOSIS_OR_CHANGE_REQUIRED" });
assert.deepEqual(evaluateCommandAttempt({ command: "npm lint", workspaceRevision: 4, events: failed }), { allowed: true, reason: "FIRST_OR_INFORMED_ATTEMPT" });
assert.deepEqual(evaluateCommandAttempt({ command: "npm test", workspaceRevision: 5, events: failed }), { allowed: true, reason: "FIRST_OR_INFORMED_ATTEMPT" });
assert.deepEqual(evaluateCommandAttempt({ command: "npm test", workspaceRevision: 4, events: [...failed, { sequence: 2, type: "diagnosis", target: "root cause", workspaceRevision: 4, result: "ok" }] }), { allowed: true, reason: "FIRST_OR_INFORMED_ATTEMPT" });

console.log("PASS baseline metrics, classification traps, schema rejection, and executable retry preflight");

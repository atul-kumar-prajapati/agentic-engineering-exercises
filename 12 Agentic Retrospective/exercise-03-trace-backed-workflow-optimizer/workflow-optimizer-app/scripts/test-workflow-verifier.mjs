import assert from "node:assert/strict";
import { gradeResponse } from "./workflow-grading.mjs";
import { validateInstructions } from "./workflow-submission-verification.mjs";

const item = { id: "x", assertions: [{ id: "fresh-final-gate", critical: true }, { id: "exact-exit-code", critical: false }] };
const good = { actions: [{ sequence: 1, type: "edit", target: "source" }, { sequence: 2, type: "verify", target: "release-gate", result: "passed", exitCode: 0 }] };
assert.deepEqual(gradeResponse(item, good).map((grade) => grade.passed), [true, true]);
assert.deepEqual(gradeResponse(item, { actions: [...good.actions].reverse() }).map((grade) => grade.passed), [false, false]);
const instructions = "Confirm scope and clarify choices. Rank authoritative evidence and record contradiction. Select context. On a failed gate, stop. Run fresh verification, capture exit code, and bind completion to it.";
assert.deepEqual(validateInstructions(instructions, []), []);
console.log("workflow optimizer verifier self-test passed");

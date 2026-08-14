import assert from "node:assert/strict";
import { verifyOutputs } from "./refactor-verification.mjs";

const cases = [{ name: "case", input: { value: 1 }, expected: { status: "same" } }];
const output = [{ name: "case", input: { value: 1 }, output: { status: "same" } }];
assert.deepEqual(verifyOutputs(output, structuredClone(output), cases), []);
const changed = structuredClone(output); changed[0].output.status = "new";
assert.ok(verifyOutputs(output, changed, cases).some((failure) => failure.includes("not identical")));
console.log("characterization refactor verifier self-test passed");

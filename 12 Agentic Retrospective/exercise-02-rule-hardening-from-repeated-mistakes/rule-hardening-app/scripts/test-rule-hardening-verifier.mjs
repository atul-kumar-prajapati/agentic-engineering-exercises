import assert from "node:assert/strict";
import { validateGuidance } from "./rule-hardening-verification.mjs";

const corrections = [
  ...[1, 2].map((id) => ({ id, rootCause: "identity-vs-presentation" })),
  ...[3, 4].map((id) => ({ id, rootCause: "canonical-enum-storage" })),
  ...[5, 6].map((id) => ({ id, rootCause: "ambient-time" })),
];
const agents = "For persistence work, read .agent/persistence.md. Run npm run test:persistence.";
const deep = "Use a stable ID, not a display label. trim canonical values to lowercase. use a caller-provided clock, not new Date. An exception needs a product contract. UI, export, and log labels are allowed. run npm run test:persistence.";
assert.deepEqual(validateGuidance(agents, deep, corrections), []);
assert.ok(validateGuidance(`${agents} Store the display label.`, deep, corrections).length > 0);
console.log("rule hardening verifier self-test passed");

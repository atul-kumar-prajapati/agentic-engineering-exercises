import assert from "node:assert/strict";
import { parseWorkflowDecisionResponse } from "../src/services/workflowDecisionContract.mjs";

const accepted = parseWorkflowDecisionResponse(202, JSON.stringify({
  id: "wf-102", customer: "Brightline", status: "Blocked", score: 74,
  owner: "Rina", note: "Waiting for signed approval",
}));
assert.deepEqual(accepted, {
  id: "wf-102", customer: "Brightline", status: "Blocked", score: 74,
  owner: "Rina", note: "Waiting for signed approval",
});
assert.throws(
  () => parseWorkflowDecisionResponse(400, JSON.stringify({ error: "Ready decisions require a longer evidence note" })),
  { message: "Ready decisions require a longer evidence note" },
);
assert.throws(() => parseWorkflowDecisionResponse(202, JSON.stringify({ ...accepted, evidenceNote: accepted.note })), /Invalid workflow success contract/);
console.log("PASS strict React-client success and error response contract");

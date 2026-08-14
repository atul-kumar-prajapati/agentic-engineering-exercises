import { describe, expect, it } from "vitest";
import { parseWorkflowResponse } from "../../src/services/workflowContractClient";

const baseWorkflow = {
  id: "wf-101",
  customer: "Atlas Co",
  status: "Blocked",
  score: 91,
  owner: "Asha",
  note: "Evidence missing",
};

describe("protected workflow response boundary", () => {
  it.each(["needs-evidence", "pending-review", "accepted"])(
    "accepts the supported decision state %s",
    (decisionState) => {
      expect(parseWorkflowResponse({ ...baseWorkflow, decisionState }).decisionState).toBe(decisionState);
    },
  );

  it("rejects a response without decisionState", () => {
    expect(() => parseWorkflowResponse(baseWorkflow)).toThrow(/decisionState/);
  });

  it("rejects an unknown decisionState", () => {
    expect(() => parseWorkflowResponse({ ...baseWorkflow, decisionState: "archived" })).toThrow(/decisionState/);
  });

  it("rejects a non-object response", () => {
    expect(() => parseWorkflowResponse(null)).toThrow(/workflow response/i);
  });
});

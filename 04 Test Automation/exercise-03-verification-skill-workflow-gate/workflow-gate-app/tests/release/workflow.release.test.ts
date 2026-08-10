import { describe, expect, it } from "vitest";
import { parseWorkflowResponse } from "../../src/services/workflowContractClient";

describe("protected workflow response boundary", () => {
  it("accepts the complete release shape", () => {
    expect(parseWorkflowResponse({
      id: "wf-101",
      customer: "Atlas Co",
      status: "Blocked",
      score: 91,
      owner: "Asha",
      note: "Evidence missing",
      decisionState: "needs-evidence",
    }).decisionState).toBe("needs-evidence");
  });

  it("rejects a response without decisionState", () => {
    expect(() => parseWorkflowResponse({
      id: "wf-101",
      customer: "Atlas Co",
      status: "Blocked",
      score: 91,
      owner: "Asha",
      note: "Evidence missing",
    })).toThrow(/decisionState/);
  });
});

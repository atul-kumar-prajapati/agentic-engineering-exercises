import path from "node:path";
import { MatchersV3, PactV3 } from "@pact-foundation/pact";
import { describe, expect, it } from "vitest";
import { listWorkflows, submitDecision } from "../../src/services/workflowContractClient";

const { eachLike, like } = MatchersV3;
const provider = new PactV3({
  consumer: "workflow-gate-app",
  provider: "workflow-rules-api",
  dir: path.resolve(process.cwd(), "pacts"),
});

describe("workflow rules API contract", () => {
  it("lists workflows", async () => {
    provider
      .given("workflows exist")
      .uponReceiving("a workflow list request")
      .withRequest({ method: "GET", path: "/api/workflows" })
      .willRespondWith({
        status: 200,
        headers: { "content-type": "application/json" },
        body: eachLike({
          id: like("wf-101"), customer: like("Atlas Co"), status: like("Blocked"), score: like(91),
          owner: like("Asha"), note: like("Evidence missing"), decisionState: like("needs-evidence"),
        }),
      });

    await provider.executeTest(async (mockServer) => {
      const workflows = await listWorkflows(mockServer.url);
      expect(workflows[0].id).toBe("wf-101");
    });
  });

  it("submits a workflow decision", async () => {
    provider
      .given("workflow wf-101 exists")
      .uponReceiving("a valid workflow decision")
      .withRequest({
        method: "POST",
        path: "/api/workflows/wf-101/decisions",
        headers: { "content-type": "application/json" },
        body: { status: "Ready", owner: "Asha", evidenceNote: "Contract evidence attached" },
      })
      .willRespondWith({
        status: 202,
        headers: { "content-type": "application/json" },
        body: {
          id: like("wf-101"), customer: like("Atlas Co"), status: "Ready", score: like(91),
          owner: "Asha", note: "Contract evidence attached", decisionState: "accepted",
        },
      });

    await provider.executeTest(async (mockServer) => {
      const workflow = await submitDecision(mockServer.url, "wf-101");
      expect(workflow.status).toBe("Ready");
    });
  });
});

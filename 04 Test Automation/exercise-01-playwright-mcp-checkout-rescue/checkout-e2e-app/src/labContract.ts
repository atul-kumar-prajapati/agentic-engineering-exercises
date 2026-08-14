export interface LabContract {
  title: string; competency: string; domain: string; mission: string; outcome: string;
  entities: string[]; seededDefects: string[]; verificationGates: string[];
  agentWorkflow: string[]; workingDeliverables: string[]; masterySignals: string[];
}

export const labContract: LabContract = {
  title: "Playwright MCP Checkout Rescue",
  competency: "04. Test Automation",
  domain: "Delayed checkout with tax and payment boundaries",
  mission: "Use live accessibility and network evidence to replace a misleading green checkout test with a reliable parallel gate.",
  outcome: "Independent tests prove request contracts, approval, decline recovery, retry, and duplicate-submit protection.",
  entities: ["tax readiness", "payment authorization", "test session", "accessibility snapshot", "request payload", "Playwright trace"],
  seededDefects: ["fixed wait and generated selector", "server state leaks through a default session", "tax and authorization payloads are untested", "retry and duplicate submission lack request-count proof"],
  verificationGates: ["failure reproduction", "live MCP accessibility and network evidence", "isolated repaired tests", "twenty-repeat two-worker run", "bounded genuine trace"],
  agentWorkflow: ["capture a without-MCP first attempt", "reproduce the flake", "inspect the live flow with MCP", "repair tests from observed boundaries", "repeat in parallel and retain a trace", "compare both attempts"],
  workingDeliverables: ["repaired end-to-end tests", "before-and-after patches", "MCP investigation and test matrix", "repeat output and trace"],
  masterySignals: ["user-facing locators", "web-first readiness", "full request-body proof", "unique per-test server sessions", "parallel independence"],
};

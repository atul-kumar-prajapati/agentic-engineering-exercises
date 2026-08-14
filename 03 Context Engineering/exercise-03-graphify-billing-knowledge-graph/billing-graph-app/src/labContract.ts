import type { LabContract } from "./types";

export const labContract = {
  title: "Graphify Billing Knowledge Graph",
  competency: "03. Context Engineering",
  skillPattern: "graphify",
  domain: "Cross-cutting recognized-revenue calculation",
  mission: "Use a queryable knowledge graph to rescue a billing incident spanning calculation, mapping, consumers, contracts, and ownership.",
  outcome: "A graph-first agent finds the shared safe edit path, rejects stale context, and fixes both consumers without changing gross volume.",
  entities: ["billing event", "recognized revenue", "gross volume", "tenant", "billing account", "dashboard", "scheduled snapshot", "owner team"],
  seededDefects: ["credits are counted as revenue", "refunds increase revenue", "results are grouped by tenant", "historical sources point to the wrong formula and owner"],
  verificationGates: ["eight protected behavior checks", "real NetworkX graph artifacts", "six answered graph questions", "source-verified uncertain edges", "fair search-versus-graph comparison"],
  agentWorkflow: ["capture a normal-search first attempt", "build the complete exercise graph", "query before reading source", "source-verify uncertain edges", "capture a graph-first attempt", "compare results"],
  workingDeliverables: ["recognized-revenue fix", "Graphify JSON, HTML, and report", "query and audit evidence", "before-and-after patches and reports"],
  masterySignals: ["queries reveal both consumers and shared calculation", "edge confidence is respected", "current and stale sources are separated", "ownership is correct", "gross volume remains unchanged"],
  backlog: [
    { id: "03-01", title: "Calculate net recognized revenue", owner: "Billing Platform", skill: "graphify", risk: "critical", done: false },
    { id: "03-02", title: "Map tenant events to billing accounts", owner: "Billing Platform", skill: "graphify", risk: "high", done: false },
    { id: "03-03", title: "Verify stale and inferred graph edges", owner: "agent candidate", skill: "graphify", risk: "high", done: false },
  ],
  evidence: [
    { gate: "eight protected behavior checks", status: "missing", proof: "run npm run test:billing" },
    { gate: "real graph artifacts", status: "partial", proof: "starter has only a stale historical extract" },
    { gate: "six answered graph questions", status: "missing", proof: "participant query evidence required" },
    { gate: "source-verified uncertain edges", status: "missing", proof: "participant graph audit required" },
    { gate: "fair comparison", status: "missing", proof: "participant before-and-after evidence required" },
  ],
  decisions: [
    { question: "What is recognized revenue?", decision: "Use the approved metric contract and verify its code edges.", status: "decided" },
    { question: "What groups dashboard totals?", decision: "Billing account, through the tenant mapping.", status: "decided" },
    { question: "Did graph-first context improve the change?", decision: "Measure from the two first attempts.", status: "open" },
  ],
} satisfies LabContract;

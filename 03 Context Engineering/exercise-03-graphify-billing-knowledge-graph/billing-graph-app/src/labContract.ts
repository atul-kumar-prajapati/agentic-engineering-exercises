import type { LabContract } from "./types";

export const labContract = {
  title: "Graphify Billing Knowledge Graph",
  competency: "03. Context Engineering",
  skillPattern: "graphify",
  domain: "Cross-cutting recognized-revenue calculation",
  mission: "Use a queryable knowledge graph to find the safe edit path across calculation, mapping, consumers, docs, and ownership.",
  outcome: "The graph-first agent fixes the metric with fewer wrong files and verified edges.",
  entities: ["billing event", "recognized revenue", "tenant", "billing account", "owner team"],
  seededDefects: ["gross charges are reported as revenue", "results are grouped by tenant", "refunds and missing mappings are mishandled"],
  verificationGates: ["five behavior checks", "real graph artifacts", "scoped query log", "fair search-versus-graph comparison"],
  agentWorkflow: ["capture normal-search attempt", "build and query graph", "source-verify uncertain edges", "capture graph-first attempt"],
  workingDeliverables: ["billing fix", "graph artifacts", "query evidence", "before-and-after patches"],
  masterySignals: ["queries narrow file access", "confidence is respected", "ownership is correct", "behavior matches the metric contract"],
  backlog: [
    { id: "03-01", title: "Calculate net recognized revenue", owner: "Billing Platform", skill: "graphify", risk: "critical", done: false },
    { id: "03-02", title: "Map tenant events to billing accounts", owner: "Billing Platform", skill: "graphify", risk: "high", done: false },
    { id: "03-03", title: "Verify stale and inferred graph edges", owner: "agent candidate", skill: "graphify", risk: "high", done: false },
  ],
  evidence: [
    { gate: "five behavior checks", status: "missing", proof: "run npm run test:billing" },
    { gate: "real graph artifacts", status: "partial", proof: "starter has only a stale historical extract" },
    { gate: "scoped query log", status: "missing", proof: "participant evidence required" },
    { gate: "fair comparison", status: "missing", proof: "participant evidence required" },
  ],
  decisions: [
    { question: "What is recognized revenue?", decision: "Use the approved metric contract and verify its code edges.", status: "decided" },
    { question: "What groups dashboard totals?", decision: "Billing account, through the tenant mapping.", status: "decided" },
    { question: "Did graph-first context improve the change?", decision: "Measure from the two first attempts.", status: "open" },
  ],
} satisfies LabContract;

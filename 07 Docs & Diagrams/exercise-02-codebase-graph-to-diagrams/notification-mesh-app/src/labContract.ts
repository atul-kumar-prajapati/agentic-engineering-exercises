import type { LabContract } from "./types";

export const labContract = {
  title: "Source-Verified Code Graph Rescue",
  competency: "07. Docs & Diagrams",
  skillPattern: "source-to-graph-to-diagram",
  domain: "Notification routing across provider availability, SMS consent, immediate delivery, and durable queue fallback.",
  mission: "Generate a code graph, repair an unsafe notification fallback, and produce diagrams whose relationships trace to source.",
  outcome: "The implementation, graph, diagrams, tests, and evidence agree at one Git source SHA.",
  entities: ["ChannelRouter", "ProviderStatus", "ConsentPolicy", "ImmediateRoute", "DurableQueue"],
  seededDefects: [
    "SMS availability bypasses explicit customer consent.",
    "The stale snapshot assigns consent checks to provider availability.",
    "The stale snapshot invents a route from immediate delivery to the durable queue.",
  ],
  verificationGates: [
    "The generated graph exactly matches source call relationships.",
    "Both Mermaid diagrams parse and contain only supported edges.",
    "Protected routing tests prove every required fallback.",
    "Traceability and hashes bind all evidence to one source SHA.",
  ],
  agentWorkflow: [
    "Generate and query the graph before editing the router.",
    "Fix consent and fallback behavior without changing protected inputs.",
    "Map graph edges to diagrams and exact source lines.",
    "Regenerate and verify all artifacts from the source commit.",
  ],
  workingDeliverables: [
    "Corrected notification router.",
    "Generated code graph and two Mermaid diagrams.",
    "Source-bound traceability and command evidence.",
  ],
  masterySignals: [
    "Generated structure is separated from inferred behavior.",
    "Diagrams contain no unsupported relationship.",
    "The fix is proven by protected tests and reproducible evidence.",
  ],
  backlog: [
    { id: "05-01", title: "SMS availability bypasses explicit consent.", owner: "agent candidate", skill: "graph construction", risk: "critical", done: false },
    { id: "05-02", title: "The stale snapshot contains unsupported dependencies.", owner: "agent candidate", skill: "source verification", risk: "high", done: false },
    { id: "05-03", title: "No diagram is bound to a reproducible graph.", owner: "agent candidate", skill: "diagram traceability", risk: "high", done: false },
  ],
  evidence: [
    { gate: "Generated graph matches source.", status: "missing", proof: "requires learner artifact" },
    { gate: "Routing behavior passes protected tests.", status: "missing", proof: "starter intentionally fails" },
    { gate: "Diagrams parse and contain supported edges.", status: "missing", proof: "requires learner diagrams" },
    { gate: "Evidence is bound to one source SHA.", status: "missing", proof: "requires learner manifest" },
  ],
  decisions: [
    { question: "What establishes structure?", decision: "The generated graph records direct source relationships.", status: "decided" },
    { question: "What establishes behavior?", decision: "Source order and protected routing tests establish behavior.", status: "decided" },
    { question: "Which stale claims remain?", decision: "The learner must verify all six claims.", status: "open" },
  ],
} satisfies LabContract;

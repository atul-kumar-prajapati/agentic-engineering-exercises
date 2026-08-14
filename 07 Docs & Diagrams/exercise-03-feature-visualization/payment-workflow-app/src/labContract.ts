import type { LabContract } from "./types";

export const labContract = {
  title: "Incident-Backed Payment Visualization",
  competency: "07. Docs & Diagrams",
  skillPattern: "implementation-to-multiple-views",
  domain: "Payment checkout authorization, capture, ledger, receipt, and idempotent webhook reconciliation.",
  mission: "Repair the duplicate-capture incident and produce four source-traceable Mermaid diagrams of the corrected feature.",
  outcome: "Architecture, state, sequence, and data diagrams agree with source, protected tests, and one Git source SHA.",
  entities: ["CheckoutOrder", "PaymentIntent", "GatewayTransaction", "LedgerEntry", "WebhookEvent", "Receipt"],
  seededDefects: [
    "Duplicate event IDs create repeated capture ledger entries.",
    "Unknown gateway references pass signature validation and are recorded.",
    "The legacy brief contains unsupported retry and ownership claims.",
  ],
  verificationGates: [
    "Protected feature cases pass without weakening signature validation.",
    "Four Mermaid diagrams parse and pass semantic checks.",
    "VIS-01 through VIS-16 map to exact source lines and required diagrams.",
    "Hashes and source SHA make the evidence reproducible.",
  ],
  agentWorkflow: [
    "Trace approved, declined, invalid, unknown, first, and duplicate cases.",
    "Repair the reconciliation boundary.",
    "Create four distinct Mermaid views from source.",
    "Verify traceability, semantics, hashes, and Git binding.",
  ],
  workingDeliverables: [
    "Corrected webhook reconciler.",
    "Architecture, reconciliation-state, sequence, and data diagrams.",
    "Source-bound evidence and contradiction decisions.",
  ],
  masterySignals: [
    "Each diagram answers a different engineering question.",
    "Failure and duplicate paths are as clear as the happy path.",
    "Every important visual claim can be checked in source.",
  ],
  backlog: [
    { id: "06-01", title: "Duplicate capture events create repeated ledger records.", owner: "agent candidate", skill: "incident visualization", risk: "critical", done: false },
    { id: "06-02", title: "Unknown gateway references are accepted.", owner: "agent candidate", skill: "boundary repair", risk: "critical", done: false },
    { id: "06-03", title: "Legacy claims conflict with the implemented feature.", owner: "agent candidate", skill: "source verification", risk: "high", done: false },
  ],
  evidence: [
    { gate: "Feature behavior passes protected cases.", status: "missing", proof: "starter intentionally fails" },
    { gate: "Four Mermaid views pass semantic verification.", status: "missing", proof: "requires learner diagrams" },
    { gate: "Sixteen relationships map to exact source.", status: "missing", proof: "requires learner traceability" },
    { gate: "Evidence is bound to one source SHA.", status: "missing", proof: "requires learner manifest" },
  ],
  decisions: [
    { question: "What defines behavior?", decision: "Source and protected cases define behavior.", status: "decided" },
    { question: "What defines visual scope?", decision: "The diagram contract defines four complementary views.", status: "decided" },
    { question: "Which legacy claims remain valid?", decision: "The learner must verify all four claims.", status: "open" },
  ],
} satisfies LabContract;

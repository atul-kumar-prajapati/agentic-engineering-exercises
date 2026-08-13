import type { LabContract } from "./types";

export const labContract = {
  title: "Payment Retry Visualization and Fix",
  competency: "07. Docs & Diagrams",
  skillPattern: "Payment Retry Visualization and Fix diagrams",
  domain: "Checkout feature with payment authorization, capture, ledger entries, receipt notification, and gateway webhook reconciliation.",
  mission: "Understand the payment integration feature and generate architecture, process flow, sequence, and ER diagrams.",
  outcome: "The four diagram files make the payment feature understandable without adding unsupported systems, actors, or tables.",
  entities: [
    "Customer",
    "CheckoutOrder",
    "OrderItem",
    "PaymentMethod",
    "PaymentIntent",
    "GatewayTransaction",
    "LedgerEntry",
    "WebhookEvent",
    "Receipt"
  ],
  seededDefects: [
    "A diagram may skip the declined-payment branch even though the gateway adapter has one.",
    "A diagram may show ledger writes before capture even though the orchestrator records capture first.",
    "A diagram may invent services that do not exist in src/payment.",
    "A diagram may omit webhook reconciliation from the architecture."
  ],
  verificationGates: [
    "Four required .excalidraw files exist under diagrams.",
    "Each diagram parses as JSON and has the expected scene root fields.",
    "Architecture, process flow, sequence, and ER diagrams each match the payment source code.",
    "No diagram contains unsupported actors, tables, or service names."
  ],
  agentWorkflow: [
    "Install or open the public diagram skill before generating files.",
    "Inspect src/payment and the payment feature brief.",
    "Generate four editable diagram files under diagrams.",
    "Review every major node, arrow, actor, and relationship against source evidence."
  ],
  workingDeliverables: [
    "Payment architecture diagram.",
    "Payment process flow diagram.",
    "Payment sequence diagram.",
    "Payment ER diagram."
  ],
  masterySignals: [
    "The diagrams are created inside the 20-minute timebox.",
    "Each diagram has a distinct purpose and readable scope.",
    "The visual model matches source code instead of guesses.",
    "The diagrams can be opened and edited directly."
  ],
  backlog: [
    {
      id: "06-01",
      title: "Create payment architecture diagram.",
      owner: "agent candidate",
      skill: "Payment Retry Visualization and Fix diagrams",
      risk: "high",
      done: false
    },
    {
      id: "06-02",
      title: "Create payment process flow diagram with success and declined paths.",
      owner: "agent candidate",
      skill: "Payment Retry Visualization and Fix diagrams",
      risk: "high",
      done: false
    },
    {
      id: "06-03",
      title: "Create payment sequence diagram from the source call order.",
      owner: "agent candidate",
      skill: "Payment Retry Visualization and Fix diagrams",
      risk: "medium",
      done: false
    },
    {
      id: "06-04",
      title: "Create payment ER diagram from the source entities and relationships.",
      owner: "agent candidate",
      skill: "Payment Retry Visualization and Fix diagrams",
      risk: "medium",
      done: false
    }
  ],
  evidence: [
    {
      gate: "Four required .excalidraw files exist under diagrams.",
      status: "missing",
      proof: "learner creates the four diagram files"
    },
    {
      gate: "Each diagram parses as JSON and has expected root fields.",
      status: "missing",
      proof: "validate the final files"
    },
    {
      gate: "Diagram content maps back to src/payment.",
      status: "partial",
      proof: "starter source exposes architecture nodes, sequence steps, and ER relationships"
    },
    {
      gate: "Unsupported nodes are removed during review.",
      status: "partial",
      proof: "compare diagrams against payment-feature-brief.md"
    }
  ],
  decisions: [
    {
      question: "What is the feature?",
      decision: "Payment integration for checkout authorization, capture, ledger, receipt, and webhook reconciliation.",
      status: "decided"
    },
    {
      question: "What is the evidence?",
      decision: "Four editable diagram files in diagrams.",
      status: "decided"
    },
    {
      question: "What must be avoided?",
      decision: "Unsupported services, actors, database tables, and arrows.",
      status: "decided"
    }
  ]
} satisfies LabContract;

export interface LabContract {
  title: string;
  competency: string;
  domain: string;
  mission: string;
  outcome: string;
  entities: string[];
  seededDefects: string[];
  verificationGates: string[];
  agentWorkflow: string[];
  workingDeliverables: string[];
  masterySignals: string[];
}

export const labContract: LabContract = {
  "title": "Risk-Based Model Routing Cost Gate",
  "competency": "10. Token Economics - Right model and token cost optimizations",
  "domain": "Model and effort routing policy for an engineering team",
  "mission": "Design a model and effort routing policy for a team using agents across planning, coding, reviews, and retros.",
  "outcome": "A team routing policy chooses model and effort by task risk, not habit.",
  "entities": [
    "routing rule",
    "usage log",
    "scenario",
    "cost estimate"
  ],
  "seededDefects": [
    "routine test edits route to max effort",
    "security review routes to cheap model without escalation",
    "policy ignores latency for incident fixes"
  ],
  "verificationGates": [
    "scenario simulation",
    "cost estimator",
    "risk override test",
    "leadership recommendation"
  ],
  "agentWorkflow": [
    "Ask the coding agent to inspect this lab contract, starter code, docs, and tests before proposing a plan.",
    "Revise the agent plan so it exercises the competency practice and avoids the common mistake.",
    "Implement the smallest working change that addresses the seeded defects.",
    "Run the verification gates and capture command evidence before writing the final review note."
  ],
  "workingDeliverables": [
    "Routing policy in config or code.",
    "Cost/latency estimator script.",
    "Scenario simulation output.",
    "Leadership recommendation for adoption."
  ],
  "masterySignals": [
    "Encode model/effort routing rules for planning, routine edits, tests, reviews, and retros.",
    "Build a small estimator or simulation using the provided scenarios and usage logs.",
    "Run the estimator against at least three advanced-engineering workflows.",
    "Tune the policy when cost, latency, or risk looks wrong."
  ]
};

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
  "title": "Repeated Mistake to Repository Rule",
  "competency": "12. Agentic Retrospective - Session review, waste reduction, and improvement",
  "domain": "Rule hardening from repeated agent corrections",
  "mission": "Turn repeated agent corrections into durable AGENTS.md rules, skills, or hooks with clear trigger criteria.",
  "outcome": "Repeated agent mistakes become durable rules, skills, or hooks with tests.",
  "entities": [
    "correction history",
    "root cause",
    "AGENTS rule",
    "hook simulation"
  ],
  "seededDefects": [
    "same correction is handled as chat advice three times",
    "rule is too vague to test",
    "hook blocks a valid command because it lacks context"
  ],
  "verificationGates": [
    "correction clustering",
    "rule specificity test",
    "hook simulation",
    "re-run seed mistakes"
  ],
  "agentWorkflow": [
    "Ask the coding agent to inspect this lab contract, starter code, docs, and tests before proposing a plan.",
    "Revise the agent plan so it exercises the competency practice and avoids the common mistake.",
    "Implement the smallest working change that addresses the seeded defects.",
    "Run the verification gates and capture command evidence before writing the final review note."
  ],
  "workingDeliverables": [
    "Updated rules/context/skill/hook files.",
    "Hook or policy tests where applicable.",
    "Correction history mapped to fixes.",
    "Re-run evidence on seed mistakes."
  ],
  "masterySignals": [
    "Cluster repeated corrections from the provided history into root causes.",
    "Choose the right fix type: rule, context file, skill, hook, or human habit.",
    "Implement at least two durable fixes.",
    "Add tests or simulations proving the fixes catch the repeated mistake."
  ]
};

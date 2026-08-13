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
  "title": "Strangler Checkout Route",
  "competency": "11. Agentic Refactoring - Test-driven tech-debt cleanup",
  "domain": "Strangler replacement for one checkout decision branch",
  "mission": "Replace one path of a tangled checkout workflow with a new module while preserving external behavior.",
  "outcome": "One branch of a tangled checkout workflow is replaced safely behind an adapter or flag.",
  "entities": [
    "legacy checkout path",
    "adapter",
    "feature flag",
    "golden output"
  ],
  "seededDefects": [
    "new path changes tax rounding",
    "adapter does not preserve error shape",
    "flag rollback still calls new module"
  ],
  "verificationGates": [
    "old/new comparison",
    "adapter contract test",
    "flag rollback test",
    "golden screenshot/output"
  ],
  "agentWorkflow": [
    "Ask the coding agent to inspect this lab contract, starter code, docs, and tests before proposing a plan.",
    "Revise the agent plan so it exercises the competency practice and avoids the common mistake.",
    "Implement the smallest working change that addresses the seeded defects.",
    "Run the verification gates and capture command evidence before writing the final review note."
  ],
  "workingDeliverables": [
    "New checkout module and adapter/flag wiring.",
    "Comparison tests for old vs new behavior.",
    "Updated app behavior for the selected branch.",
    "Rollback and residual-risk evidence."
  ],
  "masterySignals": [
    "Characterize the existing checkout path with tests and sample outputs.",
    "Build the new module behind an adapter, flag, or routing seam.",
    "Compare old and new outputs for preserved cases.",
    "Roll out only one branch of behavior, leaving the rest untouched."
  ]
};

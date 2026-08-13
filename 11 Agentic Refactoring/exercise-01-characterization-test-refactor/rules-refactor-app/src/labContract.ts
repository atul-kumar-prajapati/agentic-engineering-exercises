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
  "title": "Characterization-First Rules Refactor",
  "competency": "11. Agentic Refactoring - Test-driven tech-debt cleanup",
  "domain": "Characterization-first refactor of legacy rule evaluation",
  "mission": "Capture existing behavior around a messy rules module before refactoring it into clearer pieces.",
  "outcome": "Legacy behavior is characterized before structure changes, then refactored in small green steps.",
  "entities": [
    "behavior spec",
    "golden case",
    "legacy branch",
    "refactor step"
  ],
  "seededDefects": [
    "current behavior around overdue high-risk items is undocumented",
    "refactor changes log text used by support",
    "test is patched to match new behavior"
  ],
  "verificationGates": [
    "green baseline",
    "golden case tests",
    "preserve/change/bug table",
    "stepwise refactor proof"
  ],
  "agentWorkflow": [
    "Ask the coding agent to inspect this lab contract, starter code, docs, and tests before proposing a plan.",
    "Revise the agent plan so it exercises the competency practice and avoids the common mistake.",
    "Implement the smallest working change that addresses the seeded defects.",
    "Run the verification gates and capture command evidence before writing the final review note."
  ],
  "workingDeliverables": [
    "Characterization tests.",
    "Refactored production code.",
    "Behavior category notes tied to tests.",
    "Before/after verification evidence."
  ],
  "masterySignals": [
    "Generate a behavior spec from the current code and mark preserve/change/bug categories.",
    "Add characterization tests that pass against the current behavior.",
    "Refactor the messy module without changing preserved behavior.",
    "Keep the suite green after each logical step."
  ]
};

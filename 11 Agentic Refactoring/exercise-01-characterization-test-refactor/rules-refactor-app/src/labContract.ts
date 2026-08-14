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
  "mission": "Refactor renewal eligibility only after a public characterization test captures every protected behavior.",
  "outcome": "Git history and identical snapshots prove that a focused structural refactor preserved all ten observed results.",
  "entities": [
    "renewal account",
    "eligibility result",
    "golden observation",
    "characterization commit"
  ],
  "seededDefects": [
    "support override silently takes precedence over arrears",
    "negative late-payment counts pass the enterprise rule",
    "mature unsupported accounts retain plan-not-supported"
  ],
  "verificationGates": [
    "characterization commit precedes production edits",
    "ten public golden observations",
    "byte-equivalent before and after snapshots",
    "source-only refactor commit"
  ],
  "agentWorkflow": [
    "Inspect the public rule, behavior notes, and immutable golden cases.",
    "Add the characterization test and before snapshot before touching production code.",
    "Refactor only the decision structure in a separate source-only commit.",
    "Capture the after snapshot and run every protected verification command."
  ],
  "workingDeliverables": [
    "Public characterization test and focused Git history.",
    "Refactored renewal rule.",
    "Preserve or suspected-bug decisions.",
    "Identical before and after output evidence."
  ],
  "masterySignals": [
    "Tests the public export rather than private implementation details.",
    "Preserves exact fields, values, reason strings, precedence, and validation gaps.",
    "Separates characterization and source changes into auditable commits.",
    "Proves all ten before and after observations are identical."
  ]
};

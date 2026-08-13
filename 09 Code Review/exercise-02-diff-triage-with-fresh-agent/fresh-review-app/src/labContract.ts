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
  "title": "Independent Diff Triage",
  "competency": "09. Code Review - Code quality and risk review for merge confidence",
  "domain": "Fresh-agent review of cache and workflow-state changes",
  "mission": "Use a fresh review pass to find what the implementing agent missed, then decide which findings are merge blockers.",
  "outcome": "A fresh agent review produces signal, and the accountable owner decides what actually blocks merge.",
  "entities": [
    "fresh review prompt",
    "local storage cache",
    "mutable fixture",
    "triage table"
  ],
  "seededDefects": [
    "cached state is never updated after save",
    "sort mutates shared fixtures",
    "cache clear erases legitimate user work"
  ],
  "verificationGates": [
    "fresh-agent finding verification",
    "cache regression test",
    "human triage",
    "merge confidence note"
  ],
  "agentWorkflow": [
    "Ask the coding agent to inspect this lab contract, starter code, docs, and tests before proposing a plan.",
    "Revise the agent plan so it exercises the competency practice and avoids the common mistake.",
    "Implement the smallest working change that addresses the seeded defects.",
    "Run the verification gates and capture command evidence before writing the final review note."
  ],
  "workingDeliverables": [
    "Fresh-agent review prompt and findings.",
    "Code/test fixes for verified blockers.",
    "Triage evidence separating signal from noise.",
    "Final merge confidence note."
  ],
  "masterySignals": [
    "Ask a fresh model/session to review the diff with explicit NFR checks.",
    "Verify each finding manually against the surrounding code.",
    "Fix true merge blockers in code and tests.",
    "Record why noisy findings were dismissed."
  ]
};

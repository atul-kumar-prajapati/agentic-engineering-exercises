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
  "title": "Code Review Regression Gate",
  "competency": "09. Code Review - Code quality and risk review for merge confidence",
  "domain": "Regression review for filtering, risk scoring, and hidden work",
  "mission": "Find subtle regressions in a large agent-written UI diff that appears clean at first glance.",
  "outcome": "Subtle clean-looking regressions are caught by behavior tests and review discipline.",
  "entities": [
    "fresh review",
    "NFR checklist",
    "regression test",
    "triage decision"
  ],
  "seededDefects": [
    "blocked work disappears under all-status filter",
    "partial search no longer matches owner or note",
    "risk scoring lowers due-today blocked work"
  ],
  "verificationGates": [
    "fresh model review",
    "NFR checklist",
    "failing-then-passing tests",
    "fix/defer/dismiss triage"
  ],
  "agentWorkflow": [
    "Ask the coding agent to inspect this lab contract, starter code, docs, and tests before proposing a plan.",
    "Revise the agent plan so it exercises the competency practice and avoids the common mistake.",
    "Implement the smallest working change that addresses the seeded defects.",
    "Run the verification gates and capture command evidence before writing the final review note."
  ],
  "workingDeliverables": [
    "Failing-then-passing regression tests.",
    "Code fixes for the regressions.",
    "Review summary with severity and evidence.",
    "Residual risk notes for anything deferred."
  ],
  "masterySignals": [
    "Ask a fresh model or session to review the supplied diff for behavior drift and NFR risk.",
    "Verify each finding yourself against filtering, sorting, risk scoring, permissions, empty states, accessibility, and performance.",
    "Write tests that fail on the true regressions, then patch the implementation to restore intended behavior.",
    "Triage every finding as fix, defer, or dismiss with evidence, then re-review after the patch."
  ]
};

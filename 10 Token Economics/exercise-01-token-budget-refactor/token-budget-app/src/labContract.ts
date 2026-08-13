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
  "title": "Progressive Context Budget Refactor",
  "competency": "10. Token Economics - Right model and token cost optimizations",
  "domain": "Token-budgeted refactor of a noisy rules component",
  "mission": "Plan a refactor with a token budget, choosing context, model effort, and automation deliberately.",
  "outcome": "A refactor is planned and executed with expensive reasoning reserved for judgment-heavy work.",
  "entities": [
    "context budget",
    "model effort choice",
    "deterministic script",
    "refactor test"
  ],
  "seededDefects": [
    "plan loads whole app instead of change path",
    "routine rename spends high-effort review turns",
    "deterministic migration is done manually"
  ],
  "verificationGates": [
    "context manifest",
    "model routing log",
    "refactor test",
    "automation savings estimate"
  ],
  "agentWorkflow": [
    "Ask the coding agent to inspect this lab contract, starter code, docs, and tests before proposing a plan.",
    "Revise the agent plan so it exercises the competency practice and avoids the common mistake.",
    "Implement the smallest working change that addresses the seeded defects.",
    "Run the verification gates and capture command evidence before writing the final review note."
  ],
  "workingDeliverables": [
    "Working refactor in the starter.",
    "Tests proving behavior.",
    "Context/model budget ledger.",
    "Automation for any repeated deterministic work."
  ],
  "masterySignals": [
    "Create a context and model/effort budget before touching code.",
    "Move deterministic edits into a script or small helper where appropriate.",
    "Implement the refactor and tests without loading unrelated files.",
    "Compare planned vs actual context, commands, and verification effort."
  ]
};

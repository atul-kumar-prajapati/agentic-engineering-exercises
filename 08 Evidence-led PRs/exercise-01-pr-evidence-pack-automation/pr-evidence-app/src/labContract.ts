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
  "title": "Failure-Preserving PR Evidence Pack",
  "competency": "08. Evidence-led PRs - PR gate evidence and handoff",
  "domain": "Automated PR evidence pack for generated code",
  "mission": "Create a PR evidence pack that automatically gathers test output, build proof, screenshots, and residual risks.",
  "outcome": "A PR can explain itself with automated proof instead of reviewer guesswork.",
  "entities": [
    "PR template",
    "check output",
    "screenshot artifact",
    "risk note"
  ],
  "seededDefects": [
    "evidence pack omits failed smoke output",
    "PR template asks reviewers to infer rollback risk",
    "artifact path is not stable for CI"
  ],
  "verificationGates": [
    "evidence generator",
    "artifact path check",
    "PR template fill",
    "failure-output capture"
  ],
  "agentWorkflow": [
    "Ask the coding agent to inspect this lab contract, starter code, docs, and tests before proposing a plan.",
    "Revise the agent plan so it exercises the competency practice and avoids the common mistake.",
    "Implement the smallest working change that addresses the seeded defects.",
    "Run the verification gates and capture command evidence before writing the final review note."
  ],
  "workingDeliverables": [
    "Evidence pack generator.",
    "Updated tests/checks feeding the pack.",
    "Generated artifact folder with logs and summary.",
    "PR template section wired to the generated evidence."
  ],
  "masterySignals": [
    "Implement an evidence pack script that runs checks, captures output, and writes a PR-ready summary.",
    "Add or repair tests so the evidence pack is meaningful.",
    "Include screenshots, coverage, traces, or logs where useful for the starter.",
    "Make failure states visible rather than silently swallowed."
  ]
};

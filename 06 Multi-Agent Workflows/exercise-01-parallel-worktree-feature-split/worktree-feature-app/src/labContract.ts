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
  "title": "Parallel Worktree Conflict Rescue",
  "competency": "06. Multi-Agent Workflows - Parallel agents on isolated tasks",
  "domain": "Three-lane worktree plan for independent UI improvements",
  "mission": "Split three independent improvements across worktrees or subagents and integrate them without overlapping file edits.",
  "outcome": "Independent changes run in parallel lanes and integrate cleanly under one accountable owner.",
  "entities": [
    "worktree lane",
    "branch owner",
    "file ownership",
    "integration gate"
  ],
  "seededDefects": [
    "two lanes claim the same shared filter file",
    "one lane lacks a verification command",
    "integration owner is not assigned"
  ],
  "verificationGates": [
    "file ownership audit",
    "lane verification reports",
    "merge-order simulation",
    "final integration check"
  ],
  "agentWorkflow": [
    "Ask the coding agent to inspect this lab contract, starter code, docs, and tests before proposing a plan.",
    "Revise the agent plan so it exercises the competency practice and avoids the common mistake.",
    "Implement the smallest working change that addresses the seeded defects.",
    "Run the verification gates and capture command evidence before writing the final review note."
  ],
  "workingDeliverables": [
    "Three isolated change slices with ownership notes.",
    "Working integrated code in the starter.",
    "Conflict/risk log and final verification output.",
    "Main-thread integration summary."
  ],
  "masterySignals": [
    "Split the requested work into three non-overlapping slices with explicit file ownership.",
    "Use separate branches/worktrees or simulated agent lanes for implementation.",
    "Integrate results deliberately, resolving conflicts instead of hiding them.",
    "Run the full verification gate after integration."
  ]
};

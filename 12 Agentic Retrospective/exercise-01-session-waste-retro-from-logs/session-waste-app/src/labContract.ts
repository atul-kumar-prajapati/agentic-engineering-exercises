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
  "title": "Trace-Measured Session Waste Reduction",
  "competency": "12. Agentic Retrospective - Session review, waste reduction, and improvement",
  "domain": "Agent session waste analyzer from real-looking transcript logs",
  "mission": "Analyze provided agent session logs to find retry loops, redundant file reads, and context waste.",
  "outcome": "Agent session waste becomes measurable, then one waste pattern is eliminated with a system fix.",
  "entities": [
    "session log",
    "retry loop",
    "repeated file read",
    "waste metric"
  ],
  "seededDefects": [
    "analyzer double-counts resumed turns",
    "large context paste is not classified",
    "top waste source has no system fix"
  ],
  "verificationGates": [
    "log parser test",
    "waste metric report",
    "rule/hook/skill fix",
    "before/after simulation"
  ],
  "agentWorkflow": [
    "Ask the coding agent to inspect this lab contract, starter code, docs, and tests before proposing a plan.",
    "Revise the agent plan so it exercises the competency practice and avoids the common mistake.",
    "Implement the smallest working change that addresses the seeded defects.",
    "Run the verification gates and capture command evidence before writing the final review note."
  ],
  "workingDeliverables": [
    "Session log analyzer script.",
    "Waste metrics report.",
    "Implemented system fix in rules, hook, or skill.",
    "Before/after comparison evidence."
  ],
  "masterySignals": [
    "Parse the provided session logs for retry loops, repeated reads, abandoned turns, tool failures, and context bloat.",
    "Build a small metrics script rather than hand-counting.",
    "Implement one rule, hook, skill, or workflow change that targets the top waste source.",
    "Re-run the seed scenario or simulation to show expected reduction."
  ]
};

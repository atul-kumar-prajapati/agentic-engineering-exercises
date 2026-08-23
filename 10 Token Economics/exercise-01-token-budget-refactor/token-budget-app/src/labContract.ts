export interface LabContract {
  title: string; competency: string; domain: string; mission: string; outcome: string;
  entities: string[]; seededDefects: string[]; verificationGates: string[];
  agentWorkflow: string[]; workingDeliverables: string[]; masterySignals: string[];
}

export const labContract: LabContract = {
  title: "Progressive Context Budget Refactor",
  competency: "10. Token Economics - minimum sufficient authoritative context",
  domain: "Session-adapter refactor context selection",
  mission: "Select current task context under an exact byte budget without dropping mandatory rules or primary contracts.",
  outcome: "A real adapter refactor passes the same checks with full and selected context while selection remains fully accounted.",
  entities: ["real context source", "protected catalog", "pre-change plan", "selector ledger", "session adapter"],
  seededDefects: ["all sources are loaded", "stale and irrelevant sources consume budget", "maximum bytes are ignored", "no decision reason is recorded"],
  verificationGates: ["real byte check", "selector and adapter acceptance suites", "before-and-after patch replay", "pre-change history gate", "ledger recomputation"],
  agentWorkflow: ["Commit the context plan before code changes.", "Implement deterministic mandatory-first selection.", "Add learner edge-case tests.", "Capture exact selector output and explain planned-versus-actual cost."],
  workingDeliverables: ["Context plan.", "Selector, adapter, and tests.", "Exact ledger.", "Decision and command evidence."],
  masterySignals: ["Context cost is known before work.", "Authority and priority preserve correctness.", "Expansion follows an open question.", "Every omitted source has a reason."],
};

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
  outcome: "Selection is deterministic, progressive, fully accounted, and correct under normal and tight budgets.",
  entities: ["real context source", "protected catalog", "pre-change plan", "selector ledger"],
  seededDefects: ["all sources are loaded", "stale and irrelevant sources consume budget", "maximum bytes are ignored", "no decision reason is recorded"],
  verificationGates: ["real byte check", "selector acceptance suite", "pre-change history gate", "ledger recomputation"],
  agentWorkflow: ["Commit the context plan before code changes.", "Implement deterministic mandatory-first selection.", "Add learner edge-case tests.", "Capture exact selector output and explain planned-versus-actual cost."],
  workingDeliverables: ["Context plan.", "Selector and tests.", "Exact ledger.", "Decision and command evidence."],
  masterySignals: ["Context cost is known before work.", "Authority and priority preserve correctness.", "Expansion follows an open question.", "Every omitted source has a reason."],
};

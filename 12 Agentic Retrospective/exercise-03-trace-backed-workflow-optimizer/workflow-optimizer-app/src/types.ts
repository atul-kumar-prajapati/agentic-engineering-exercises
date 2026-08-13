export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface WorkCard {
  id: string;
  title: string;
  owner: string;
  skill: string;
  risk: RiskLevel;
  done: boolean;
}

export interface EvidenceItem {
  gate: string;
  status: "missing" | "partial" | "ready";
  proof: string;
}

export interface DecisionItem {
  question: string;
  decision: string;
  status: "open" | "decided" | "deferred";
}

export interface LabContract {
  title: string;
  competency: string;
  skillPattern: string;
  domain: string;
  mission: string;
  outcome: string;
  entities: string[];
  seededDefects: string[];
  verificationGates: string[];
  agentWorkflow: string[];
  workingDeliverables: string[];
  masterySignals: string[];
  backlog: WorkCard[];
  evidence: EvidenceItem[];
  decisions: DecisionItem[];
}

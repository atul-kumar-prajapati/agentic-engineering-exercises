export interface LabContract {
  title: string; competency: string; domain: string; mission: string; outcome: string;
  entities: string[]; seededDefects: string[]; verificationGates: string[];
  agentWorkflow: string[]; workingDeliverables: string[]; masterySignals: string[];
}

export const labContract: LabContract = {
  title: "Risk-Based Model Routing Cost Gate",
  competency: "10. Token Economics - measured model routing",
  domain: "Coding-agent task routing by risk, ambiguity, and scope",
  mission: "Lower expected model cost while preserving clarification, quality, and safety boundaries.",
  outcome: "A field-based policy clears held-out routes and a deterministic offline 36-run cost gate.",
  entities: ["routing decision", "eligible tier lane", "recorded response", "expected escalation cost"],
  seededDefects: ["every task uses reasoning", "ambiguity never clarifies", "retry and escalation are unpriced", "quality and safety are unmeasured"],
  verificationGates: ["held-out routing matrix", "response SHA binding", "cost reconciliation", "quality and safety floors", "all-reasoning comparison"],
  agentWorkflow: ["Implement routes from task fields.", "Derive measurements from the protected recorded pack.", "Reconcile tokens to call cost.", "Use the protected scorer and adopt only when all gates pass."],
  workingDeliverables: ["Router and tests.", "Offline routing measurements.", "Generated cost model.", "Policy and adoption evidence."],
  masterySignals: ["Unknown work clarifies before execution.", "High risk never downgrades for savings.", "Failed calls are charged before escalation.", "Savings and quality come from repeated measurements."],
};

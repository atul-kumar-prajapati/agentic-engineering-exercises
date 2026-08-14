export interface LabContract {
  title: string; competency: string; domain: string; mission: string; outcome: string;
  entities: string[]; seededDefects: string[]; verificationGates: string[];
  agentWorkflow: string[]; workingDeliverables: string[]; masterySignals: string[];
}

export const labContract: LabContract = {
  title: "Code Review Regression Gate",
  competency: "09. Code Review - measured recall and precision",
  domain: "Real-model prompt regression testing over bad and clean diffs",
  mission: "Improve a review prompt using repeated real-model evidence without adding false merge blockers or benchmark answers.",
  outcome: "The candidate clears protected recall, precision, and no-regression thresholds across 18 uncached samples.",
  entities: ["baseline prompt", "candidate prompt", "protected cases", "response judgments", "scorecard"],
  seededDefects: ["overcautious candidate invites false blockers", "case IDs previously leaked meaning", "candidate-only evaluation hid regression", "unbound prose scores could be fabricated"],
  verificationGates: ["answer-leak check", "real-provider sample gate", "response hash binding", "deterministic metric scorer", "prompt-only source commit"],
  agentWorkflow: ["Run baseline and starter candidate against all cases.", "Label responses against the protected catalog.", "Improve only the candidate from measured misses and false blockers.", "Rerun all samples and adopt only if every gate passes."],
  workingDeliverables: ["Final prompt.", "Raw outputs and run metadata.", "Response-bound judgments and scorecard.", "Review report and verifier output."],
  masterySignals: ["Recall and clean precision are both measured.", "Repeated samples expose variance.", "The provider does not encode answers.", "The adoption decision follows every threshold."],
};

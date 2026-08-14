export interface LabContract {
  title: string; competency: string; domain: string; mission: string; outcome: string;
  entities: string[]; seededDefects: string[]; verificationGates: string[];
  agentWorkflow: string[]; workingDeliverables: string[]; masterySignals: string[];
}

export const labContract: LabContract = {
  title: "Trace-Measured Session Waste Reduction",
  competency: "12. Agentic Retrospective - Session review, waste reduction, and improvement",
  domain: "Event-derived waste analysis and comparable workflow replay",
  mission: "Correct false-positive waste metrics, block unchanged failure retries, and prove the effect in a fresh comparable session.",
  outcome: "Raw traces show lower preventable work and final correctness after an executable workflow improvement.",
  entities: ["session event", "workspace revision", "retry preflight", "final verification"],
  seededDefects: ["every read is counted as duplicate", "first failed commands are counted as retries", "completion does not require post-write verification"],
  verificationGates: ["protected baseline metrics", "classification edge cases", "executable preflight", "condition-matched replay"],
  agentWorkflow: ["Derive baseline metrics from immutable events.", "Implement and test the retry preflight.", "Replay the same task in a new matched session.", "Compare analyzer output and retain raw evidence."],
  workingDeliverables: ["Analyzer, preflight, and participant tests.", "Raw replay trace and metadata.", "Derived before and after metrics.", "Root-cause retrospective and Git evidence."],
  masterySignals: ["Separates useful attempts from preventable repeats.", "Resets retry state only after diagnosis or change.", "Uses comparable replay conditions.", "Proves final verification happened after the last write."],
};

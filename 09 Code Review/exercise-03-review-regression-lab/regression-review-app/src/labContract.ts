export interface LabContract {
  title: string; competency: string; domain: string; mission: string; outcome: string;
  entities: string[]; seededDefects: string[]; verificationGates: string[];
  agentWorkflow: string[]; workingDeliverables: string[]; masterySignals: string[];
}

export const labContract: LabContract = {
  title: "Code Review Skill Hardening",
  competency: "09. Code Review - reusable review workflow evaluation",
  domain: "Agent-neutral skill improvement over defective and clean diffs",
  mission: "Improve a reusable code-review skill and prove it raises review quality without false blockers.",
  outcome: "Six fresh-session artifacts pass a deterministic local scorer without an API key.",
  entities: ["starter skill", "review cases", "fresh sessions", "transcripts", "scorecard"],
  seededDefects: ["shallow starter review workflow", "missed cross-boundary regressions", "unsupported merge blockers"],
  verificationGates: ["skill answer-leak check", "protected-runner and transcript hash binding", "security and historical coverage", "clean-control precision gate", "focused skill commit"],
  agentWorkflow: ["Run each case without the skill.", "Improve the skill from observed misses.", "Run each case in new sessions with the skill.", "Score and adopt only when every gate passes."],
  workingDeliverables: ["Improved skill.", "Six run documents and transcripts.", "Before and after patches.", "Scorecard and report."],
  masterySignals: ["The skill generalizes beyond protected cases.", "Findings state behavior and evidence.", "A safe change is not blocked."],
};

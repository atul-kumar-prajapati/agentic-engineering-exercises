export interface LabContract {
  title: string; competency: string; domain: string; mission: string; outcome: string;
  entities: string[]; seededDefects: string[]; verificationGates: string[];
  agentWorkflow: string[]; workingDeliverables: string[]; masterySignals: string[];
}

export const labContract: LabContract = {
  title: "Domain Modeling Skill Product Rules Rescue",
  competency: "03. Context Engineering",
  domain: "Workspace AI-history export authorization",
  mission: "Resolve overloaded product language before implementing a security-sensitive rule.",
  outcome: "A fresh agent uses a compact glossary and decision record to implement the correct boundary.",
  entities: ["billing customer", "workspace", "workspace membership", "workspace role", "data residency"],
  seededDefects: ["Growth is incorrectly eligible", "membership status is ignored", "workspace identity and data residency are ignored"],
  verificationGates: ["six protected behavior checks", "compact context check", "decision record check", "fair before-and-after evidence"],
  agentWorkflow: ["capture an unskilled first attempt", "build the domain model", "run a fresh skilled attempt", "compare behavior and verify"],
  workingDeliverables: ["CONTEXT.md", "decision record", "policy and tests", "before-and-after evidence"],
  masterySignals: ["terms have one meaning", "source conflicts are resolved", "code uses the domain vocabulary", "all boundaries are executable"],
};

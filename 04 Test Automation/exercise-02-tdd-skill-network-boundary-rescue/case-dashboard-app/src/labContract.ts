export interface LabContract {
  title: string; competency: string; domain: string; mission: string; outcome: string;
  entities: string[]; seededDefects: string[]; verificationGates: string[];
  agentWorkflow: string[]; workingDeliverables: string[]; masterySignals: string[];
}

export const labContract: LabContract = {
  title: "TDD Skill Network Boundary Rescue",
  competency: "04. Test Automation",
  domain: "Network-backed support case states",
  mission: "Use red-green-refactor vertical slices to repair retry and build trustworthy component coverage.",
  outcome: "Six independent user-visible states are protected through the real request seam.",
  entities: ["loading state", "case list", "empty state", "MSW handler", "retry request"],
  seededDefects: ["retry clears the error without requesting", "unhandled requests only warn", "handler overrides leak"],
  verificationGates: ["green starter smoke", "protected retry acceptance", "six-state component suite", "TDD evidence verifier"],
  agentWorkflow: ["write one failing behavior test", "make the smallest fix", "refactor while green", "repeat and record every cycle"],
  workingDeliverables: ["product fix", "focused tests", "strict MSW setup", "red-green evidence"],
  masterySignals: ["tests lead code", "public seams are used", "network state is isolated", "retry proves a second request"],
};

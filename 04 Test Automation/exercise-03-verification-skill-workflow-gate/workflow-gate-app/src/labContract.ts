export interface LabContract {
  title: string; competency: string; domain: string; mission: string; outcome: string;
  entities: string[]; seededDefects: string[]; verificationGates: string[];
  agentWorkflow: string[]; workingDeliverables: string[]; masterySignals: string[];
}

export const labContract: LabContract = {
  title: "Verification Skill Workflow Gate",
  competency: "04. Test Automation",
  domain: "React and Spring workflow release boundary",
  mission: "Replace an unsupported green claim with one fresh full-stack verification command.",
  outcome: "Client shape, provider behavior, tests, and builds must all pass before completion is claimed.",
  entities: ["workflow response", "decision state", "transition", "verification command", "exit code"],
  seededDefects: ["client trusts an unchecked cast", "provider omits decisionState", "provider accepts an unknown transition"],
  verificationGates: ["client release tests", "client agent check", "full Maven tests", "submission evidence verifier"],
  agentWorkflow: ["audit the old claim", "define proof for every requirement", "fix exposed behavior", "run one fresh gate and report evidence"],
  workingDeliverables: ["boundary tests", "client and provider fix", "single gate command", "fresh output and claim audit"],
  masterySignals: ["claims follow commands", "all components are covered", "failures stop the gate", "output includes exit status"],
};

export interface LabContract {
  title: string;
  competency: string;
  domain: string;
  mission: string;
  outcome: string;
  entities: string[];
  seededDefects: string[];
  verificationGates: string[];
  agentWorkflow: string[];
  workingDeliverables: string[];
  masterySignals: string[];
}

export const labContract: LabContract = {
  title: "Handoff Skill Incident Rescue",
  competency: "03. Context Engineering - Session compaction and verified handoff",
  domain: "Customer escalation SLA incident recovery across fresh agent sessions",
  mission: "Distil an unreliable prior agent session into a verified handoff that enables a fresh agent to complete the incident fix.",
  outcome: "A fresh agent implements the current SLA rule without inheriting stale thresholds, ownership changes, or false completion claims.",
  entities: [
    "incident request",
    "authoritative SLA policy",
    "generated session handoff",
    "regression evidence",
  ],
  seededDefects: [
    "the partial implementation uses a superseded 24-hour threshold",
    "automatic escalation incorrectly replaces the existing owner",
    "the previous progress note claims completion despite failing behavior tests",
  ],
  verificationGates: [
    "current SLA boundary regression tests",
    "manual escalation and ownership preservation tests",
    "saved workflow state and queue total tests",
    "handoff content and before-after evidence checks",
  ],
  agentWorkflow: [
    "Run the incident once with raw session context and capture the first result.",
    "Verify conflicting claims against current policies, code, and executable checks.",
    "Generate a compact handoff with the Handoff skill for a fresh implementation session.",
    "Complete the fix from the handoff and compare the verified result with the baseline.",
  ],
  workingDeliverables: [
    "Automatic escalation implementation and regression coverage.",
    "Before and after implementation patches from first attempts.",
    "Unedited generated handoff and a source-backed handoff audit.",
    "Reproducible incident, handoff, and repository verification output.",
  ],
  masterySignals: [
    "Distinguish current authoritative requirements from plausible but outdated context.",
    "Carry verified decisions and remaining work across a fresh context boundary.",
    "Exclude irrelevant logs and unsupported completion claims from the handoff.",
    "Use executable evidence to prove the fresh agent completed the correct behavior.",
  ],
};

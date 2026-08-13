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
  "title": "Feature Flag Kill-Switch Proof",
  "competency": "08. Evidence-led PRs - PR gate evidence and handoff",
  "domain": "Risky UI rollout guarded by feature flag and rollback proof",
  "mission": "Prove that a risky UI feature is gated, observable, and reversible before a reviewer sees the PR.",
  "outcome": "A risky agent-written feature is gated, observable, and reversible.",
  "entities": [
    "feature flag",
    "rollback config",
    "telemetry event",
    "disabled state"
  ],
  "seededDefects": [
    "flag default differs between dev and CI",
    "rollback path leaves telemetry enabled",
    "disabled state still calls the new API"
  ],
  "verificationGates": [
    "flag on/off tests",
    "rollback script",
    "telemetry assertion",
    "PR evidence capture"
  ],
  "agentWorkflow": [
    "Ask the coding agent to inspect this lab contract, starter code, docs, and tests before proposing a plan.",
    "Revise the agent plan so it exercises the competency practice and avoids the common mistake.",
    "Implement the smallest working change that addresses the seeded defects.",
    "Run the verification gates and capture command evidence before writing the final review note."
  ],
  "workingDeliverables": [
    "Feature flag implementation in code/config.",
    "Telemetry or audit behavior.",
    "Tests for on/off/rollback states.",
    "Rollback evidence suitable for a PR."
  ],
  "masterySignals": [
    "Implement a real feature flag around the risky UI behavior.",
    "Add telemetry/audit events for enabled, disabled, and rollback paths.",
    "Build a rollback script or documented command that changes behavior without a deploy.",
    "Test both flag states and the failure path."
  ]
};

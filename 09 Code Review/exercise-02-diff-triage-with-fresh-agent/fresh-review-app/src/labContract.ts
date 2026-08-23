export interface LabContract {
  title: string; competency: string; domain: string; mission: string; outcome: string;
  entities: string[]; seededDefects: string[]; verificationGates: string[];
  agentWorkflow: string[]; workingDeliverables: string[]; masterySignals: string[];
}

export const labContract: LabContract = {
  title: "Independent Diff Triage",
  competency: "09. Code Review - independent risk review and evidence-based triage",
  domain: "Browser cache persistence in a workflow queue",
  mission: "Use a fresh agent session to review the protected caching diff, verify its findings, and fix only supported merge blockers.",
  outcome: "The reviewed cache change is accepted only after every supported blocker is fixed and replayed.",
  entities: ["protected review range", "fresh reviewer session", "workflow cache", "structured findings"],
  seededDefects: ["persistence lifecycle risk", "untrusted cache data", "shared-state mutation risk", "reviewer-noise claim"],
  verificationGates: ["protected fixture verification", "fresh-context evidence verification", "cache acceptance tests", "source-SHA scope gate"],
  agentWorkflow: ["Run a fresh review with only the allowed context.", "Verify every finding and the seeded claim against the head.", "Fix confirmed blockers and add learner regression tests.", "Bind findings, tests, and command output to the focused source commit."],
  workingDeliverables: ["Fresh prompt and session record.", "Structured and Markdown review.", "Focused fixes and regression tests.", "Fixture, test, and verifier output."],
  masterySignals: ["Reviewer independence is explicit and auditable.", "Blockers have concrete scenarios and impact.", "Unsupported noise is dismissed with code evidence.", "Source history contains no unrelated changes."],
};

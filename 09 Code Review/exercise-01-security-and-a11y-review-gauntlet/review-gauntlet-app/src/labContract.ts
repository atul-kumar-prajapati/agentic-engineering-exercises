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
  title: "Security and Accessibility Review Gauntlet",
  competency: "09. Code Review",
  domain: "Evidence-backed review of an exact access-approval PR containing scanner signal, scanner noise, and manual behavior defects.",
  mission: "Classify the protected PR findings, repair confirmed blockers at the correct boundary, and prove them with regression tests.",
  outcome: "A reviewer can distinguish reproducible impact from pattern matches and prevent cross-boundary regressions from merging.",
  entities: ["protected Git range", "scanner finding", "manual finding", "server transition", "regression test", "merge decision"],
  seededDefects: ["scanner signal mixed with scanner noise", "manual interaction risk", "cross-boundary policy risk"],
  verificationGates: [
    "Bundle SHAs and generated diff match the protected manifest.",
    "Every submitted finding is anchored, classified, and proved.",
    "Protected component and server tests prove the repaired behavior.",
    "Learner regression tests cover each confirmed blocker.",
    "Git history binds fixes and tests to the submitted evidence.",
  ],
  agentWorkflow: [
    "Verify and clone the protected bundle.",
    "Run the scanner and independently inspect behavior boundaries.",
    "Record the review before changing the vulnerable starter.",
    "Fix blockers, add regression tests, and re-run the review gates.",
  ],
  workingDeliverables: [
    "Focused application fixes at the affected boundaries.",
    "Learner regression test suite.",
    "Structured and Markdown review reports.",
    "Raw scanner, fixture, and final verification output.",
  ],
  masterySignals: [
    "Scanner output is reproduced and classified rather than copied.",
    "Important manual findings are identified despite no scanner warning.",
    "Trusted-boundary conclusions are supported by direct reproduction.",
    "Every blocker maps to a focused regression test and exact evidence.",
  ],
};

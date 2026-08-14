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
  title: "Failure-Preserving PR Evidence Pack",
  competency: "08. Evidence-led PRs",
  domain: "Pull-request evidence generated from protected check results and uploaded by GitHub Actions.",
  mission: "Build an evidence generator and workflow that publish complete proof while preserving the original failing exit code.",
  outcome: "Reviewers receive commit-bound results, immutable artifact digests, explicit risk, reviewer action, and rollback without a false green check.",
  entities: ["source commit", "check result", "artifact", "evidence pack", "workflow run"],
  seededDefects: [
    "There is no executable generator for the protected results.",
    "The failed smoke result can be omitted or rewritten.",
    "No root workflow uploads stable evidence after failure.",
    "Risk, reviewer action, and rollback are not enforced per check.",
  ],
  verificationGates: [
    "The generator passes mixed-result and all-passing protected fixtures.",
    "Every artifact is copied byte-for-byte and receives a SHA-256 digest.",
    "The workflow uses read-only permissions, pinned actions, and always-run verification and upload.",
    "Source SHA and Git history bind evidence to the reviewed implementation.",
  ],
  agentWorkflow: [
    "Inspect the fixture, evidence schema, and workflow requirements.",
    "Implement one fixture-independent generator.",
    "Add the repository-root pull-request workflow.",
    "Generate, verify, and document the failing evidence pack.",
  ],
  workingDeliverables: [
    "Evidence generator with the required CLI.",
    "Repository-root GitHub Actions workflow.",
    "Generated JSON pack and copied artifacts.",
    "Reviewer-facing evidence summary and verification output.",
  ],
  masterySignals: [
    "Failure evidence is complete before the generator exits non-zero.",
    "A failed check cannot become a successful workflow.",
    "Every review claim is connected to a commit and immutable artifact.",
  ],
};

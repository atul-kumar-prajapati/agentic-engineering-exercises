export interface LabContract {
  title: string; competency: string; domain: string; mission: string; outcome: string;
  entities: string[]; seededDefects: string[]; verificationGates: string[];
  agentWorkflow: string[]; workingDeliverables: string[]; masterySignals: string[];
}

export const labContract: LabContract = {
  title: "Strangler Checkout Route",
  competency: "11. Agentic Refactoring - Test-driven tech-debt cleanup",
  domain: "Card-payment strangler with authorization-safe fallback",
  mission: "Move only card checkout behind a new slice while every legacy consumer and public result remains stable.",
  outcome: "An injectable and reversible router proves safe rollout without duplicate authorization.",
  entities: ["checkout request", "public payment result", "legacy path", "card authorization"],
  seededDefects: ["all payment types still use legacy", "card slice is absent", "authorization-safe fallback is unimplemented"],
  verificationGates: ["legacy-to-card result comparison", "protected route matrix", "flag-off rollback", "focused source history"],
  agentWorkflow: ["Inspect the immutable route and result contract.", "Build the card slice behind the injected seam.", "Move only enabled card requests and preserve safe failure behavior.", "Run protected checks and capture evidence after the source commit."],
  workingDeliverables: ["Card slice, router, and participant test.", "Route and contract comparison evidence.", "Rollback and authorization-safety proof.", "Focused source commit record."],
  masterySignals: ["Keeps gift-card, invoice, and unknown types legacy.", "Matches exact approved and declined outputs including rounding.", "Falls back only before authorization.", "Disables the new slice without deleting legacy code."],
};

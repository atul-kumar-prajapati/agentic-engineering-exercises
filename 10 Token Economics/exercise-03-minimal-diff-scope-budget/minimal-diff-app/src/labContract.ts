import type { LabContract } from "./types";

export const labContract = {
  title: "Minimal-Diff Scope Budget",
  competency: "10. Token Economics - bounded implementation scope",
  skillPattern: "Pre-committed minimal-diff budget",
  domain: "Single-action design-system variant migration",
  mission: "Ship the export variant migration within a pre-declared Git scope budget while preserving legacy actions.",
  outcome: "One helper and one test change, with exact history-backed scope evidence and no unrelated cleanup.",
  entities: ["ScopePlan", "VariantHelper", "RegressionTest", "GitNumstat"],
  seededDefects: ["Export remains legacy-primary.", "Declared scope can be self-reported.", "Shared cleanup is tempting.", "Unknown legacy fallback is easy to lose."],
  verificationGates: ["Protected behavior test passes.", "Plan commit precedes source.", "Only allowed paths change.", "Git numstat stays within budget."],
  agentWorkflow: ["Commit the exact scope plan.", "Change only export helper and focused test.", "Run protected and learner checks.", "Record Git-derived scope and avoided work."],
  workingDeliverables: ["Plan commit.", "Minimal source commit.", "Scope ledger.", "Avoided-work and verification evidence."],
  masterySignals: ["The request defines scope.", "Git data proves the budget.", "Legacy behavior stays tested."],
  backlog: [
    { id: "scope-01", title: "Migrate export without touching legacy consumers", owner: "learner", skill: "Minimal diff", risk: "high", done: false },
    { id: "scope-02", title: "Prove checkout and delete remain unchanged", owner: "learner", skill: "Regression test", risk: "critical", done: false },
    { id: "scope-03", title: "Bind declared scope to Git numstat", owner: "reviewer", skill: "Evidence", risk: "medium", done: false },
  ],
  evidence: [
    { gate: "Plan before code", status: "missing", proof: "requires learner history" },
    { gate: "Behavior preserved", status: "partial", proof: "protected test supplied" },
    { gate: "Actual diff within budget", status: "missing", proof: "requires source commit" },
  ],
  decisions: [
    { question: "Expand shared code?", decision: "No; one helper branch satisfies the request.", status: "decided" },
    { question: "How is scope measured?", decision: "From source commit numstat.", status: "decided" },
    { question: "Has the migration passed?", decision: "Pending learner implementation and evidence.", status: "open" },
  ],
} satisfies LabContract;

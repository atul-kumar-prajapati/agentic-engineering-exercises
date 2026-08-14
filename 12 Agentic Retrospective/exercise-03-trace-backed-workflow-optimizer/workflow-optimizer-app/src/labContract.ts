import type { LabContract } from "./types";

export const labContract = {
  title: "Trace-Backed Workflow Optimizer",
  competency: "12. Agentic Retrospective - Session review, waste reduction, and improvement",
  skillPattern: "trace-backed workflow optimizer",
  domain: "Deterministically graded workflow optimization with held-out replays",
  mission: "Turn repeated trace failures into one general workflow revision and adopt it only when raw matched runs prove quality and cost gates.",
  outcome: "A one-file workflow change generalizes to held-out tasks without critical regressions or excessive context cost.",
  entities: ["FailureTrace", "WorkflowInstruction", "ReplayResponse", "DeterministicGrade"],
  seededDefects: ["Baseline guidance does not establish scope or authority.", "Partial checks can support completion.", "Broad context is loaded before decisions are known."],
  verificationGates: ["Trace-backed failure clusters.", "48 matched raw runs.", "Held-out critical quality.", "Variance and cost thresholds."],
  agentWorkflow: ["Benchmark the unchanged workflow.", "Cluster repeated causes before editing.", "Commit only general workflow instructions.", "Rerun all lanes and adopt from deterministic evidence."],
  workingDeliverables: ["Candidate workflow.", "Raw hashed baseline and candidate runs.", "Generated benchmark.", "Failure analysis, adoption decision, and Git proof."],
  masterySignals: ["Uses all runs rather than selecting winners.", "Keeps grading independent from agent claims.", "Improves both train and held-out quality.", "Rejects quality gains that violate critical or cost gates."],
  backlog: [
    { id: "12-03-01", title: "Scope and clarification failures", owner: "agent candidate", skill: "trace-backed workflow optimizer", risk: "high", done: false },
    { id: "12-03-02", title: "Evidence authority failures", owner: "accountable owner", skill: "trace-backed workflow optimizer", risk: "high", done: false },
    { id: "12-03-03", title: "Unsupported completion failures", owner: "agent candidate", skill: "trace-backed workflow optimizer", risk: "critical", done: false },
    { id: "12-03-04", title: "Excess context cost", owner: "accountable owner", skill: "trace-backed workflow optimizer", risk: "medium", done: false }
  ],
  evidence: [
    { gate: "Trace-backed failure clusters.", status: "missing", proof: "requires learner evidence" },
    { gate: "48 matched raw runs.", status: "missing", proof: "requires learner evidence" },
    { gate: "Held-out critical quality.", status: "partial", proof: "protected scorer ready" },
    { gate: "Variance and cost thresholds.", status: "partial", proof: "protected scorer ready" }
  ],
  decisions: [
    { question: "What may change?", decision: "Only workflow/instructions.md in the candidate commit.", status: "decided" },
    { question: "Who grades outputs?", decision: "The protected deterministic grader.", status: "decided" },
    { question: "Does the candidate generalize?", decision: "Use held-out replay evidence.", status: "open" },
    { question: "Should the workflow be adopted?", decision: "Require every quality, critical, variance, and cost gate.", status: "open" }
  ]
} satisfies LabContract;

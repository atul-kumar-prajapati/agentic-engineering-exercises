import type { LabContract } from "./types";

export const labContract = {
  title: "Skill Benchmark and Package Gate",
  competency: "05. Skill Packaging",
  skillPattern: "skill-creator quality evaluation and packaging",
  domain: "Source-backed incident summaries",
  mission: "Benchmark baseline and with-skill task quality before distributing an installable skill.",
  outcome: "Only an evaluated skill with improved held-out quality and no critical regression is packaged.",
  entities: ["eval task", "assertion", "baseline run", "skill run", "variance", ".skill archive"],
  seededDefects: ["facts lack source IDs", "inference is presented as fact", "open follow-ups appear complete"],
  verificationGates: ["four protected evals", "three runs per lane", "held-out and critical checks", "archive validation"],
  agentWorkflow: ["measure baseline and unchanged skill", "grade evidence-backed assertions", "improve and rerun", "package passing version"],
  workingDeliverables: ["improved skill", "raw run results", "benchmark report", "installable archive"],
  masterySignals: ["quality is measured", "variance and cost are visible", "held-out tasks decide", "package matches evaluated version"],
  backlog: [
    { id: "05-03-01", title: "Run baseline and unchanged skill", owner: "agent candidate", skill: "skill-creator", risk: "high", done: false },
    { id: "05-03-02", title: "Improve source and uncertainty handling", owner: "agent candidate", skill: "skill-creator", risk: "critical", done: false },
    { id: "05-03-03", title: "Package only a passing version", owner: "accountable owner", skill: "skill-creator", risk: "high", done: false },
  ],
  evidence: [
    { gate: "four protected evals", status: "ready", proof: "evals/evals.json" },
    { gate: "three runs per lane", status: "missing", proof: "participant results required" },
    { gate: "held-out and critical checks", status: "partial", proof: "verifier supplied" },
    { gate: "archive validation", status: "missing", proof: "package after benchmark" },
  ],
  decisions: [
    { question: "Which version ships?", decision: "Select by held-out quality with no critical regression.", status: "decided" },
    { question: "Is added context worth its cost?", decision: "Compare quality, variance, tokens, and time.", status: "open" },
    { question: "Is the archive installable?", decision: "Verify the packaged evaluated version.", status: "open" },
  ],
} satisfies LabContract;

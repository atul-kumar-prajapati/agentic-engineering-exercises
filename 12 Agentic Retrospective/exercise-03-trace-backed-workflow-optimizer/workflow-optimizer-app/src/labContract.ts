import type { LabContract } from "./types";

export const labContract = {
  "title": "Trace-Backed Workflow Optimizer",
  "competency": "12. Agentic Retrospective",
  "skillPattern": "trace-backed skill optimizer",
  "domain": "Alert triage agent for on-call incidents, service ownership, SLO impact, customer comms, and escalation notes.",
  "mission": "Analyze failed agent traces and turn repeated skill mistakes into a measured skill improvement, hook, or team rule.",
  "outcome": "A broken alert-triage skill improves because trace evidence reveals trigger misses, repeated reads, skipped checks, and weak output contracts.",
  "entities": [
    "Alert",
    "ServiceOwner",
    "SloImpact",
    "EscalationNote",
    "TraceEvent",
    "SkillPatch"
  ],
  "seededDefects": [
    "The skill triggers for generic debugging questions and wastes context.",
    "Agents repeatedly read service ownership files instead of using the cached map.",
    "The workflow skips customer-impact classification when logs are noisy.",
    "Retros produce complaints but no skill patch or eval case."
  ],
  "verificationGates": [
    "Trace analysis identifies repeated reads, retry loops, skipped checks, and trigger misses.",
    "At least one skill patch is backed by a failing trace case.",
    "A hook or rule is added only when it prevents a repeated mistake.",
    "Post-change eval shows fewer misses or a clearer remaining risk."
  ],
  "agentWorkflow": [
    "Read traces and group mistakes by cause.",
    "Choose skill, rule, hook, or habit as the corrective mechanism.",
    "Patch the smallest durable artifact.",
    "Add an eval or check so the same mistake is visible next time."
  ],
  "workingDeliverables": [
    "Trace retro with ranked waste and failure patterns.",
    "Patched skill or team rule.",
    "Regression case from a real trace.",
    "Before and after evidence for the improvement."
  ],
  "masterySignals": [
    "Retros produce operating-system changes.",
    "Fixes target repeated causes, not one-off annoyance.",
    "The team can measure whether the skill improved."
  ],
  "backlog": [
    {
      "id": "04-01",
      "title": "The skill triggers for generic debugging questions and wastes context.",
      "owner": "agent candidate",
      "skill": "trace-backed skill optimizer",
      "risk": "high",
      "done": false
    },
    {
      "id": "04-02",
      "title": "Agents repeatedly read service ownership files instead of using the cached map.",
      "owner": "accountable owner",
      "skill": "trace-backed skill optimizer",
      "risk": "medium",
      "done": false
    },
    {
      "id": "04-03",
      "title": "The workflow skips customer-impact classification when logs are noisy.",
      "owner": "agent candidate",
      "skill": "trace-backed skill optimizer",
      "risk": "critical",
      "done": false
    },
    {
      "id": "04-04",
      "title": "Retros produce complaints but no skill patch or eval case.",
      "owner": "accountable owner",
      "skill": "trace-backed skill optimizer",
      "risk": "medium",
      "done": false
    }
  ],
  "evidence": [
    {
      "gate": "Trace analysis identifies repeated reads, retry loops, skipped checks, and trigger misses.",
      "status": "missing",
      "proof": "needs learner evidence"
    },
    {
      "gate": "At least one skill patch is backed by a failing trace case.",
      "status": "partial",
      "proof": "seeded check ready for implementation"
    },
    {
      "gate": "A hook or rule is added only when it prevents a repeated mistake.",
      "status": "ready",
      "proof": "seeded check ready for implementation"
    },
    {
      "gate": "Post-change eval shows fewer misses or a clearer remaining risk.",
      "status": "partial",
      "proof": "seeded check ready for implementation"
    }
  ],
  "decisions": [
    {
      "question": "How will the team prove step 1?",
      "decision": "Read traces and group mistakes by cause.",
      "status": "decided"
    },
    {
      "question": "How will the team prove step 2?",
      "decision": "Choose skill, rule, hook, or habit as the corrective mechanism.",
      "status": "decided"
    },
    {
      "question": "How will the team prove step 3?",
      "decision": "Patch the smallest durable artifact.",
      "status": "open"
    },
    {
      "question": "How will the team prove step 4?",
      "decision": "Add an eval or check so the same mistake is visible next time.",
      "status": "open"
    }
  ]
} satisfies LabContract;

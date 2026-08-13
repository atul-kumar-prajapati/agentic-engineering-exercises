import type { LabContract } from "./types";

export const labContract = {
  "title": "Graph-Backed Notification Fallback Rescue",
  "competency": "07. Docs & Diagrams",
  "skillPattern": "graph-to-diagram",
  "domain": "Notification mesh with campaign triggers, template rendering, channel routing, consent checks, and delivery audit events.",
  "mission": "Convert a codebase graph snapshot into verified C4 and sequence diagrams, then use those diagrams to guide a safe change.",
  "outcome": "Architecture diagrams are generated from actual code relationships and verified by implementing one small notification workflow change.",
  "entities": [
    "CampaignTrigger",
    "TemplateRenderer",
    "ConsentCheck",
    "ChannelRouter",
    "DeliveryAttempt",
    "AuditEvent"
  ],
  "seededDefects": [
    "The existing sequence diagram skips the consent check.",
    "A graph edge says SMS delivery calls audit directly, but code routes through channel router.",
    "The runbook says email is the fallback channel for all failures, which is false for opted-out users.",
    "One diagram labels a batch trigger as synchronous."
  ],
  "verificationGates": [
    "Diagrams cite graph nodes and code files they were verified against.",
    "At least one stale diagram edge is corrected.",
    "A notification behavior change uses the diagrams to identify the safe edit path.",
    "The final docs include residual diagram uncertainty."
  ],
  "agentWorkflow": [
    "Start from the graph snapshot instead of freehand diagrams.",
    "Verify edges against code before publishing diagrams.",
    "Patch one notification behavior or docs drift.",
    "Keep diagrams near the code they explain."
  ],
  "workingDeliverables": [
    "Updated C4-style diagram.",
    "Updated sequence diagram.",
    "Working React change or validation check.",
    "Evidence that diagrams match code paths."
  ],
  "masterySignals": [
    "Diagrams explain real behavior.",
    "Graph data speeds but does not replace verification.",
    "Docs are useful to the next agent."
  ],
  "backlog": [
    {
      "id": "05-01",
      "title": "The existing sequence diagram skips the consent check.",
      "owner": "agent candidate",
      "skill": "graph-to-diagram",
      "risk": "high",
      "done": false
    },
    {
      "id": "05-02",
      "title": "A graph edge says SMS delivery calls audit directly, but code routes through channel router.",
      "owner": "accountable owner",
      "skill": "graph-to-diagram",
      "risk": "medium",
      "done": false
    },
    {
      "id": "05-03",
      "title": "The runbook says email is the fallback channel for all failures, which is false for opted-out users.",
      "owner": "agent candidate",
      "skill": "graph-to-diagram",
      "risk": "critical",
      "done": false
    },
    {
      "id": "05-04",
      "title": "One diagram labels a batch trigger as synchronous.",
      "owner": "accountable owner",
      "skill": "graph-to-diagram",
      "risk": "medium",
      "done": false
    }
  ],
  "evidence": [
    {
      "gate": "Diagrams cite graph nodes and code files they were verified against.",
      "status": "missing",
      "proof": "needs learner evidence"
    },
    {
      "gate": "At least one stale diagram edge is corrected.",
      "status": "partial",
      "proof": "seeded check ready for implementation"
    },
    {
      "gate": "A notification behavior change uses the diagrams to identify the safe edit path.",
      "status": "ready",
      "proof": "seeded check ready for implementation"
    },
    {
      "gate": "The final docs include residual diagram uncertainty.",
      "status": "partial",
      "proof": "seeded check ready for implementation"
    }
  ],
  "decisions": [
    {
      "question": "How will the team prove step 1?",
      "decision": "Start from the graph snapshot instead of freehand diagrams.",
      "status": "decided"
    },
    {
      "question": "How will the team prove step 2?",
      "decision": "Verify edges against code before publishing diagrams.",
      "status": "decided"
    },
    {
      "question": "How will the team prove step 3?",
      "decision": "Patch one notification behavior or docs drift.",
      "status": "open"
    },
    {
      "question": "How will the team prove step 4?",
      "decision": "Keep diagrams near the code they explain.",
      "status": "open"
    }
  ]
} satisfies LabContract;

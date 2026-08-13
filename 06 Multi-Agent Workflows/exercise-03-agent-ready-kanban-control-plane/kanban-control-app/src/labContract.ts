import type { LabContract } from "./types";

export const labContract = {
  "title": "Agent Kanban Collision Control",
  "competency": "06. Multi-Agent Workflows",
  "skillPattern": "triage / to-issues / kanban board",
  "domain": "Support escalation workspace with customer-impact cards, reproduction links, severity, owner routing, and integration queue.",
  "mission": "Turn a noisy backlog into agent-ready cards, isolated worktrees, review queues, and integration ownership.",
  "outcome": "Multiple agents can work in parallel because the board encodes issue state, ownership, blockers, review gates, and merge order.",
  "entities": [
    "Escalation",
    "TriageState",
    "Worktree",
    "AgentCard",
    "ReviewQueue",
    "MergePlan"
  ],
  "seededDefects": [
    "Two cards ask agents to edit the shared escalation schema at the same time.",
    "A ready-for-agent label is applied before reproduction steps exist.",
    "The merge queue has no owner for resolving cross-card conflicts.",
    "Human-review cards are mixed with autonomous bugfix cards."
  ],
  "verificationGates": [
    "Backlog states distinguish needs-info, ready-for-agent, ready-for-human, blocked, and done.",
    "Every agent card has ownership, touched area, commands, and merge criteria.",
    "Worktree plan avoids overlapping edits where possible.",
    "Integration evidence records which agent outputs were accepted, revised, or rejected."
  ],
  "agentWorkflow": [
    "Triage cards before spawning or assigning agents.",
    "Split work by ownership and conflict risk.",
    "Use isolated branches or worktrees for implementation.",
    "Keep the main thread responsible for review, integration, and final evidence."
  ],
  "workingDeliverables": [
    "Updated triage board.",
    "Worktree or branch plan with collision warnings.",
    "At least one working card implementation in React.",
    "Integration note with accepted and rejected agent outputs."
  ],
  "masterySignals": [
    "Parallelism is intentional, not chaotic.",
    "The main owner keeps control of integration.",
    "Cards are small enough for independent agent execution."
  ],
  "backlog": [
    {
      "id": "04-01",
      "title": "Two cards ask agents to edit the shared escalation schema at the same time.",
      "owner": "agent candidate",
      "skill": "triage / to-issues / kanban board",
      "risk": "high",
      "done": false
    },
    {
      "id": "04-02",
      "title": "A ready-for-agent label is applied before reproduction steps exist.",
      "owner": "accountable owner",
      "skill": "triage / to-issues / kanban board",
      "risk": "medium",
      "done": false
    },
    {
      "id": "04-03",
      "title": "The merge queue has no owner for resolving cross-card conflicts.",
      "owner": "agent candidate",
      "skill": "triage / to-issues / kanban board",
      "risk": "critical",
      "done": false
    },
    {
      "id": "04-04",
      "title": "Human-review cards are mixed with autonomous bugfix cards.",
      "owner": "accountable owner",
      "skill": "triage / to-issues / kanban board",
      "risk": "medium",
      "done": false
    }
  ],
  "evidence": [
    {
      "gate": "Backlog states distinguish needs-info, ready-for-agent, ready-for-human, blocked, and done.",
      "status": "missing",
      "proof": "needs learner evidence"
    },
    {
      "gate": "Every agent card has ownership, touched area, commands, and merge criteria.",
      "status": "partial",
      "proof": "seeded check ready for implementation"
    },
    {
      "gate": "Worktree plan avoids overlapping edits where possible.",
      "status": "ready",
      "proof": "seeded check ready for implementation"
    },
    {
      "gate": "Integration evidence records which agent outputs were accepted, revised, or rejected.",
      "status": "partial",
      "proof": "seeded check ready for implementation"
    }
  ],
  "decisions": [
    {
      "question": "How will the team prove step 1?",
      "decision": "Triage cards before spawning or assigning agents.",
      "status": "decided"
    },
    {
      "question": "How will the team prove step 2?",
      "decision": "Split work by ownership and conflict risk.",
      "status": "decided"
    },
    {
      "question": "How will the team prove step 3?",
      "decision": "Use isolated branches or worktrees for implementation.",
      "status": "open"
    },
    {
      "question": "How will the team prove step 4?",
      "decision": "Keep the main thread responsible for review, integration, and final evidence.",
      "status": "open"
    }
  ]
} satisfies LabContract;

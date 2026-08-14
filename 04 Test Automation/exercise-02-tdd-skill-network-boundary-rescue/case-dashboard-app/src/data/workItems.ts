import type { WorkItem } from "../types";

export const workItems: WorkItem[] = [
  {
    "id": "compon-01",
    "name": "Atlas Co",
    "priority": "High",
    "status": "Blocked",
    "score": 91,
    "summary": "Needs manager review",
    "note": "Security exception pending",
    "owner": "Asha",
    "dueInDays": 0,
    "tags": [
      "component-tests",
      "customer-visible",
      "needs-evidence"
    ]
  },
  {
    "id": "compon-02",
    "name": "Brightline",
    "priority": "Medium",
    "status": "In Review",
    "score": 67,
    "summary": "Waiting on customer data",
    "note": "SLA at risk in 2 days",
    "owner": "Mateo",
    "dueInDays": 1,
    "tags": [
      "component-tests",
      "internal",
      "ready-for-agent"
    ]
  },
  {
    "id": "compon-03",
    "name": "Cedar Labs",
    "priority": "Low",
    "status": "Ready",
    "score": 42,
    "summary": "Can proceed after QA pass",
    "note": "No blockers",
    "owner": "Rina",
    "dueInDays": 2,
    "tags": [
      "component-tests",
      "customer-visible",
      "ready-for-agent"
    ]
  },
  {
    "id": "compon-04",
    "name": "DeltaWorks",
    "priority": "High",
    "status": "Escalated",
    "score": 88,
    "summary": "Policy mismatch found",
    "note": "Legal review requested",
    "owner": "Nikhil",
    "dueInDays": 3,
    "tags": [
      "component-tests",
      "internal",
      "needs-evidence"
    ]
  },
  {
    "id": "compon-05",
    "name": "Evergreen",
    "priority": "Medium",
    "status": "Queued",
    "score": 56,
    "summary": "Missing evidence packet",
    "note": "Owner reassignment needed",
    "owner": "Asha",
    "dueInDays": 5,
    "tags": [
      "component-tests",
      "customer-visible",
      "ready-for-agent"
    ]
  },
  {
    "id": "compon-06",
    "name": "ForgeStack",
    "priority": "Low",
    "status": "Ready",
    "score": 38,
    "summary": "Automation candidate",
    "note": "Good first follow-up",
    "owner": "Mateo",
    "dueInDays": 8,
    "tags": [
      "component-tests",
      "internal",
      "ready-for-agent"
    ]
  },
  {
    "id": "compon-07",
    "name": "Granite Ops",
    "priority": "High",
    "status": "Blocked",
    "score": 94,
    "summary": "Data conflict detected",
    "note": "Requires rollback plan",
    "owner": "Rina",
    "dueInDays": 13,
    "tags": [
      "component-tests",
      "customer-visible",
      "needs-evidence"
    ]
  },
  {
    "id": "compon-08",
    "name": "Harbor Nine",
    "priority": "Medium",
    "status": "In Review",
    "score": 72,
    "summary": "Manual approval needed",
    "note": "Waiting on audit note",
    "owner": "Nikhil",
    "dueInDays": 21,
    "tags": [
      "component-tests",
      "internal",
      "ready-for-agent"
    ]
  }
];

export const activityEvents = [
  { id: "evt-1", actor: "Agent Pilot", text: "Drafted a triage summary", time: "09:15" },
  { id: "evt-2", actor: "QA Lead", text: "Asked for evidence before approval", time: "10:10" },
  { id: "evt-3", actor: "Product", text: "Clarified the high-risk boundary", time: "11:35" },
  { id: "evt-4", actor: "Reviewer", text: "Flagged missing rollback notes", time: "13:20" },
];

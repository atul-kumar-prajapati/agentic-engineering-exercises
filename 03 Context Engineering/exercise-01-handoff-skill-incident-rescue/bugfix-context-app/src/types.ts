export type Priority = "Low" | "Medium" | "High";
export type WorkflowStatus = "Queued" | "Ready" | "In Review" | "Blocked" | "Escalated";
export type EscalationMode = "none" | "manual" | "automatic";

export interface WorkItem {
  id: string;
  name: string;
  priority: Priority;
  status: WorkflowStatus;
  escalationMode: EscalationMode;
  waitingHours: number;
  score: number;
  summary: string;
  note: string;
  owner: string;
  dueInDays: number;
  tags: string[];
}

export interface ActionDraft {
  owner: string;
  note: string;
  status: WorkflowStatus;
}

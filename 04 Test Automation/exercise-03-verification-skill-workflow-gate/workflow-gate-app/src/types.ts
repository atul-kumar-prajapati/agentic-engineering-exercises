export type Priority = "Low" | "Medium" | "High";
export type WorkflowStatus = "Queued" | "Ready" | "In Review" | "Blocked" | "Escalated";

export interface WorkItem {
  id: string;
  name: string;
  priority: Priority;
  status: WorkflowStatus;
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

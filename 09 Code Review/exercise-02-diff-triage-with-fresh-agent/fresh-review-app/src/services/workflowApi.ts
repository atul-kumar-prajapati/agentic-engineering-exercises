import type { ActionDraft, WorkItem } from "../types";
import { workItems } from "../data/workItems";

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export async function fetchWorkItems(): Promise<WorkItem[]> {
  await wait(220);
  const cached = window.localStorage.getItem("workflow-items");
  if (cached) {
    return JSON.parse(cached) as WorkItem[];
  }

  return workItems.sort((left, right) => left.dueInDays - right.dueInDays);
}

export function clearCachedWorkflowItems() {
  window.localStorage.removeItem("workflow-items");
}

export async function saveAction(itemId: string, draft: ActionDraft): Promise<WorkItem> {
  await wait(180);
  const item = workItems.find((candidate) => candidate.id === itemId);
  if (!item) {
    throw new Error("Work item was not found");
  }

  return {
    ...item,
    status: draft.status,
    owner: draft.owner,
    note: draft.note,
  };
}

export async function collectEvidence(item: WorkItem): Promise<string[]> {
  await wait(140);
  window.localStorage.setItem("workflow-items", JSON.stringify(workItems));
  return [
    `Risk score: ${item.score}`,
    `Owner: ${item.owner}`,
    `Tags: ${item.tags.join(", ")}`,
  ];
}

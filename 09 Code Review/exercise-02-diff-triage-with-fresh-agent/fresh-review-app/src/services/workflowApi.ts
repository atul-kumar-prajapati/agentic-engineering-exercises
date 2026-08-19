import type { ActionDraft, WorkItem } from "../types";
import { workItems } from "../data/workItems";

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

function readCachedItems(): WorkItem[] | null {
  const cached = window.localStorage.getItem("workflow-items");
  if (!cached) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(cached);
  } catch {
    parsed = null;
  }
  if (Array.isArray(parsed)) return parsed as WorkItem[];
  window.localStorage.removeItem("workflow-items");
  return null;
}

function currentWorkflowItems(): WorkItem[] {
  return readCachedItems() ?? [...workItems];
}

export async function fetchWorkItems(): Promise<WorkItem[]> {
  await wait(220);
  const cached = readCachedItems();
  if (cached) {
    return cached;
  }

  return [...workItems].sort((left, right) => left.dueInDays - right.dueInDays);
}

export function clearCachedWorkflowItems() {
  window.localStorage.removeItem("workflow-items");
}

export async function saveAction(itemId: string, draft: ActionDraft): Promise<WorkItem> {
  await wait(180);
  const current = currentWorkflowItems();
  const item = current.find((candidate) => candidate.id === itemId);
  if (!item) {
    throw new Error("Work item was not found");
  }

  const updated: WorkItem = {
    ...item,
    status: draft.status,
    owner: draft.owner,
    note: draft.note,
  };
  window.localStorage.setItem("workflow-items", JSON.stringify(current.map((candidate) => (candidate.id === updated.id ? updated : candidate))));
  return updated;
}

export async function collectEvidence(item: WorkItem): Promise<string[]> {
  await wait(140);
  return [
    `Risk score: ${item.score}`,
    `Owner: ${item.owner}`,
    `Tags: ${item.tags.join(", ")}`,
  ];
}

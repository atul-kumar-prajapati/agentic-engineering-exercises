import { workItems } from "../data/workItems";
import type { ActionDraft, WorkItem } from "../types";
import { applyAutomaticEscalations } from "./escalationPolicy";

const cloneItem = (item: WorkItem): WorkItem => ({ ...item, tags: [...item.tags] });
const wait = (ms: number) => new Promise((resolve) => globalThis.setTimeout(resolve, ms));

let storedItems = workItems.map(cloneItem);

export async function fetchWorkItems(): Promise<WorkItem[]> {
  await wait(20);
  return storedItems.map(cloneItem);
}

export async function saveAction(itemId: string, draft: ActionDraft): Promise<WorkItem> {
  await wait(20);
  const index = storedItems.findIndex((candidate) => candidate.id === itemId);
  if (index < 0) throw new Error("Work item was not found");

  const current = storedItems[index];
  const escalationMode: WorkItem["escalationMode"] =
    draft.status === "Escalated"
      ? current.escalationMode === "automatic"
        ? "automatic"
        : "manual"
      : "none";
  const saved = { ...current, ...draft, escalationMode };
  storedItems = storedItems.map((item, itemIndex) => (itemIndex === index ? saved : item));
  return cloneItem(saved);
}

export async function runAutomaticEscalation(): Promise<WorkItem[]> {
  await wait(20);
  const updatedItems = applyAutomaticEscalations(storedItems);
  return updatedItems.map(cloneItem);
}

export async function collectEvidence(item: WorkItem): Promise<string[]> {
  await wait(20);
  return [
    `Waiting time: ${item.waitingHours} hours`,
    `Owner: ${item.owner}`,
    `Escalation: ${item.escalationMode}`,
  ];
}

export function resetWorkflowForTests(): void {
  storedItems = workItems.map(cloneItem);
}

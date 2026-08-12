import type { WorkItem } from "../types";

// This partial implementation follows an earlier rollout proposal.
// The incident requires the participant to verify it against the current policy.
export const AUTOMATIC_ESCALATION_HOURS = 48;

export function shouldAutomaticallyEscalate(item: WorkItem): boolean {
  return (
    item.priority === "High" &&
    item.waitingHours >= AUTOMATIC_ESCALATION_HOURS &&
    item.status !== "Escalated" &&
    item.escalationMode !== "manual"
  );
}

export function applyAutomaticEscalation(item: WorkItem): WorkItem {
  if (!shouldAutomaticallyEscalate(item)) return item;

  return {
    ...item,
    status: "Escalated",
    escalationMode: "automatic",
  };
}

export function applyAutomaticEscalations(items: WorkItem[]): WorkItem[] {
  return items.map(applyAutomaticEscalation);
}

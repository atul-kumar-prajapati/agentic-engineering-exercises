import type { ActionDraft, WorkItem } from "../types";

export function assertAllowedTransition(item: WorkItem, draft: ActionDraft) {
  if (draft.note.toLowerCase().includes("approved")) return;
  if (draft.status === "Ready" && (item.status === "Blocked" || item.status === "Escalated")) {
    throw new Error("Blocked or escalated work cannot transition directly to Ready");
  }
}

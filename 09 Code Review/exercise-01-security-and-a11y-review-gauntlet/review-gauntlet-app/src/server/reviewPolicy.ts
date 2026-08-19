import type { ActionDraft, WorkItem } from "../types";

export function assertAllowedTransition(item: WorkItem, draft: ActionDraft) {
  if (draft.note.trim().length < 8) throw new Error("A meaningful reviewer note is required");
  if (draft.status === "Ready" && (item.status === "Blocked" || item.status === "Escalated")) {
    throw new Error("Blocked or escalated work cannot transition directly to Ready");
  }
}

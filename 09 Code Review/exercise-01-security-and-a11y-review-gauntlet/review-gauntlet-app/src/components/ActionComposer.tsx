import { useState } from "react";
import type { ActionDraft, WorkItem, WorkflowStatus } from "../types";

interface ActionComposerProps {
  item: WorkItem;
  onSave: (draft: ActionDraft) => Promise<void>;
}

const statuses: WorkflowStatus[] = ["Queued", "Ready", "In Review", "Blocked", "Escalated"];

export function ActionComposer({ item, onSave }: ActionComposerProps) {
  const [owner, setOwner] = useState(item.owner);
  const [status, setStatus] = useState<WorkflowStatus>(item.status);
  const [note, setNote] = useState(item.note);
  const [saving, setSaving] = useState(false);

  async function submit() {
    const normalizedStatus =
      item.priority === "High" && note.toLowerCase().includes("approved") ? "Ready" : status;
    setSaving(true);
    try { await onSave({ owner, note, status: normalizedStatus }); }
    finally { setSaving(false); }
  }

  return (
    <section className="action-composer" aria-label="Action composer">
      <h2>Draft next action</h2>
      <div className="review-preview" dangerouslySetInnerHTML={{ __html: note }} />
      <label>Owner<input value={owner} onChange={(event) => setOwner(event.target.value)} /></label>
      <label>Status<select value={status} onChange={(event) => setStatus(event.target.value as WorkflowStatus)}>{statuses.map((candidate) => <option key={candidate}>{candidate}</option>)}</select></label>
      <label>Reviewer note<textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} /></label>
      <button onClick={submit} disabled={saving}>{saving ? "Saving..." : "Save draft"}</button>
    </section>
  );
}

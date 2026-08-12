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
    setSaving(true);
    try {
      await onSave({ owner, note, status });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="action-composer" aria-label="Action composer">
      <h2>Draft next action</h2>
      <label>
        Owner
        <input value={owner} onChange={(event) => setOwner(event.target.value)} />
      </label>
      <label>
        Status
        <select value={status} onChange={(event) => setStatus(event.target.value as WorkflowStatus)}>
          {statuses.map((candidate) => (
            <option key={candidate}>{candidate}</option>
          ))}
        </select>
      </label>
      <label>
        Reviewer note
        <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} />
      </label>
      <button type="button" onClick={submit} disabled={saving || note.trim().length < 8}>
        {saving ? "Saving..." : "Save draft"}
      </button>
    </section>
  );
}

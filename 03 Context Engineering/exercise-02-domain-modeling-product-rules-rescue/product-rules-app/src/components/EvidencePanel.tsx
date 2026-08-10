import type { WorkItem } from "../types";

interface EvidencePanelProps {
  item: WorkItem;
  evidence: string[];
  onCollect: () => Promise<void>;
}

export function EvidencePanel({ item, evidence, onCollect }: EvidencePanelProps) {
  return (
    <section className="evidence-panel" aria-label="Evidence panel">
      <div className="section-title">
        <h2>Evidence</h2>
        <button type="button" onClick={onCollect}>
          Collect
        </button>
      </div>
      {evidence.length === 0 ? (
        <p className="muted">No evidence collected for {item.name} yet.</p>
      ) : (
        <ul>
          {evidence.map((entry) => (
            <li key={entry}>{entry}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

import type { WorkItem } from "../types";
import { calculateRisk, riskLabel } from "../utils/scoring";

interface WorkQueueProps {
  items: WorkItem[];
  selectedId: string;
  onSelect: (item: WorkItem) => void;
}

export function WorkQueue({ items, selectedId, onSelect }: WorkQueueProps) {
  return (
    <section className="queue" aria-label="Work queue">
      {items.map((item) => {
        const risk = calculateRisk(item);
        return (
          <button
            className={item.id === selectedId ? "queue-item active" : "queue-item"}
            key={item.id}
            onClick={() => onSelect(item)}
            type="button"
          >
            <span>
              <strong>{item.name}</strong>
              <small>{item.summary}</small>
            </span>
            <span className="risk-pill" data-level={riskLabel(risk)}>
              {risk}
            </span>
          </button>
        );
      })}
    </section>
  );
}

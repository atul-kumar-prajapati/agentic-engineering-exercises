import type { WorkItem } from "../types";
import { calculateRisk, riskLabel } from "../utils/scoring";

interface DetailPanelProps {
  item: WorkItem;
}

export function DetailPanel({ item }: DetailPanelProps) {
  const risk = calculateRisk(item);

  return (
    <section className="detail-panel" aria-label="Selected work item details">
      <div className="detail-heading">
        <div>
          <p className="eyebrow">Selected item</p>
          <h2>{item.name}</h2>
        </div>
        <span className="risk-pill" data-level={riskLabel(risk)}>
          {riskLabel(risk)}
        </span>
      </div>
      <dl className="detail-grid">
        <div>
          <dt>Status</dt>
          <dd>{item.status}</dd>
        </div>
        <div>
          <dt>Priority</dt>
          <dd>{item.priority}</dd>
        </div>
        <div>
          <dt>Owner</dt>
          <dd>{item.owner}</dd>
        </div>
        <div>
          <dt>Due</dt>
          <dd>{item.dueInDays === 0 ? "Today" : `${item.dueInDays} days`}</dd>
        </div>
      </dl>
      <p>{item.note}</p>
      <div className="tag-row">
        {item.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </section>
  );
}

import type { Incident } from "../data/incidents";
import { calculateSeverity } from "../utils/scoring";

export function SeverityBadge({ incident }: { incident: Incident }) {
  const severity = calculateSeverity(incident);

  return (
    <span className="severity-badge" data-severity={severity}>
      {severity}
    </span>
  );
}

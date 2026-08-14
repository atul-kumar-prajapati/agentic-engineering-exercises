import type { Incident } from "../data/incidents";

export function SeverityBadge({ incident }: { incident: Incident }) {
  // Seeded ESC-120 defect: the UI bypasses the scoring rule.
  return <span className="severity-badge" data-severity={incident.declaredSeverity}>{incident.declaredSeverity}</span>;
}

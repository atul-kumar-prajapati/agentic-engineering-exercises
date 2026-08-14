import type { Incident, Severity } from "../data/incidents";

export function calculateSeverity(incident: Incident): Severity {
  // Seeded ESC-120 defect: inherited parent severity is ignored.
  return incident.declaredSeverity;
}

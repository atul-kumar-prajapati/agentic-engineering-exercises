import type { Incident, Severity } from "../data/incidents";

const severityRank: Record<Severity, number> = {
  Low: 0,
  Medium: 1,
  High: 2,
  Critical: 3,
};

export function calculateSeverity(incident: Incident): Severity {
  const inheritedSeverity = incident.inheritedSeverity;

  if (
    inheritedSeverity &&
    severityRank[inheritedSeverity] > severityRank[incident.declaredSeverity]
  ) {
    return inheritedSeverity;
  }

  return incident.declaredSeverity;
}

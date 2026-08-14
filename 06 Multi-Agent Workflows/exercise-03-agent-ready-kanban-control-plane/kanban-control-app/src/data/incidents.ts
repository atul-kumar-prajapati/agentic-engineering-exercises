export type Severity = "Low" | "Medium" | "High" | "Critical";

export interface Incident {
  id: string;
  summary: string;
  declaredSeverity: Severity;
  parentId?: string;
  inheritedSeverity?: Severity;
}

export const incidents: Incident[] = [
  { id: "INC-120-P", summary: "Payment authorization failures", declaredSeverity: "Critical" },
  {
    id: "INC-120-C",
    summary: "Regional symptom linked to the parent incident",
    declaredSeverity: "Low",
    parentId: "INC-120-P",
    inheritedSeverity: "Critical",
  },
  { id: "INC-121", summary: "Delayed audit export", declaredSeverity: "Medium" },
];

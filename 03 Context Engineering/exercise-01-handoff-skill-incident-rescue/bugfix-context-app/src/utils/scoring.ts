import type { WorkItem } from "../types";

const priorityWeight = {
  Low: 1,
  Medium: 2,
  High: 3,
} as const;

export function calculateRisk(item: WorkItem): number {
  const urgency = item.dueInDays === 0 ? 24 : Math.max(0, 20 - item.dueInDays);
  const statusPenalty = item.status === "Blocked" || item.status === "Escalated" ? 18 : 6;
  return Math.min(100, item.score + priorityWeight[item.priority] * 7 + urgency + statusPenalty);
}

export function riskLabel(score: number): "Watch" | "Needs review" | "Critical" {
  if (score >= 90) return "Critical";
  if (score >= 70) return "Needs review";
  return "Watch";
}

export function summarizePortfolio(items: WorkItem[]) {
  const critical = items.filter((item) => calculateRisk(item) >= 90).length;
  const blocked = items.filter((item) => item.status === "Blocked" || item.status === "Escalated").length;
  const averageRisk = Math.round(items.reduce((sum, item) => sum + calculateRisk(item), 0) / items.length);

  return {
    critical,
    blocked,
    averageRisk,
    ready: items.filter((item) => item.status === "Ready").length,
  };
}

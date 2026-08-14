import type { EvidenceItem, LabContract, RiskLevel, WorkCard } from "./types";

const riskWeight: Record<RiskLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

export function readinessScore(contract: LabContract) {
  const evidenceReady = contract.evidence.filter((item) => item.status === "ready").length;
  const decisionsClosed = contract.decisions.filter((item) => item.status !== "open").length;
  const defectPenalty = contract.backlog.filter((item) => riskWeight[item.risk] >= 3 && !item.done).length * 8;
  const base = 45 + evidenceReady * 9 + decisionsClosed * 7;
  return Math.max(0, Math.min(100, base - defectPenalty));
}

export function evidenceStatus(items: EvidenceItem[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});
}

export function riskSummary(cards: WorkCard[]) {
  return cards.reduce<Record<RiskLevel, number>>((acc, card) => {
    acc[card.risk] = (acc[card.risk] ?? 0) + 1;
    return acc;
  }, { low: 0, medium: 0, high: 0, critical: 0 });
}

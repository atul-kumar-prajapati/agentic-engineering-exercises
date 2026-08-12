import type { LabContract } from "./labContract";

export function calculateReadiness(contract: LabContract) {
  const requiredSignals = [
    contract.entities.length >= 4,
    contract.seededDefects.length >= 3,
    contract.verificationGates.length >= 4,
    contract.agentWorkflow.length >= 4,
    contract.workingDeliverables.length >= 4,
  ];
  const passed = requiredSignals.filter(Boolean).length;
  const score = Math.round((passed / requiredSignals.length) * 100);
  return {
    score,
    status: score === 100 ? "ready for lab work" : "needs stronger scaffolding",
  };
}

export function groupByRisk(defects: string[]) {
  return defects.reduce<Record<string, string[]>>((groups, defect, index) => {
    const risk = index === 0 ? "critical" : index === 1 ? "high" : "medium";
    groups[risk] = [...(groups[risk] ?? []), defect];
    return groups;
  }, {});
}

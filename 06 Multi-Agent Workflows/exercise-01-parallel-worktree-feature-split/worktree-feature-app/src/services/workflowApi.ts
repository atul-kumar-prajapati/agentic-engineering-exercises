import type { ActionDraft, WorkItem } from "../types";
import { workItems } from "../data/workItems";
import { calculateRisk } from "../utils/scoring";

// Lane-local until the integration owner adds EvidenceBundle to src/types.ts.
export interface EvidenceBundle {
  id: string;
  owner: string;
  status: WorkItem["status"];
  calculatedRisk: number;
  evidence: string[];
}

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export async function fetchWorkItems(): Promise<WorkItem[]> {
  await wait(220);
  return workItems;
}

export async function saveAction(itemId: string, draft: ActionDraft): Promise<WorkItem> {
  await wait(180);
  const item = workItems.find((candidate) => candidate.id === itemId);
  if (!item) {
    throw new Error("Work item was not found");
  }

  return {
    ...item,
    status: draft.status,
    owner: draft.owner,
    note: draft.note,
  };
}

export async function collectEvidence(item: WorkItem): Promise<string[]> {
  await wait(140);
  return [
    `Risk score: ${item.score}`,
    `Owner: ${item.owner}`,
    `Tags: ${item.tags.join(", ")}`,
  ];
}

export function createEvidenceBundle(item: WorkItem, evidence: string[]): EvidenceBundle {
  return {
    id: item.id,
    owner: item.owner,
    status: item.status,
    calculatedRisk: calculateRisk(item),
    evidence: [...evidence],
  };
}

export function serializeEvidenceBundle(bundle: EvidenceBundle): string {
  return `${JSON.stringify(bundle, null, 2)}\n`;
}

export function downloadEvidenceBundle(item: WorkItem, evidence: string[]): EvidenceBundle {
  const bundle = createEvidenceBundle(item, evidence);
  const blob = new Blob([serializeEvidenceBundle(bundle)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${item.id}-evidence.json`;
  link.click();
  URL.revokeObjectURL(url);

  return bundle;
}

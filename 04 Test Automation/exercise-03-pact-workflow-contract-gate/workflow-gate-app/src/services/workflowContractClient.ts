export interface ContractWorkflow {
  id: string;
  customer: string;
  status: string;
  score: number;
  owner: string;
  note: string;
  decisionState: string;
}

export async function listWorkflows(baseUrl = ""): Promise<ContractWorkflow[]> {
  const response = await fetch(`${baseUrl}/api/workflows`);
  if (!response.ok) throw new Error(`Workflow list failed with ${response.status}`);
  return response.json() as Promise<ContractWorkflow[]>;
}

export async function submitDecision(baseUrl: string, workflowId: string) {
  const response = await fetch(`${baseUrl}/api/workflows/${workflowId}/decisions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status: "Ready", owner: "Asha", evidenceNote: "Contract evidence attached" }),
  });
  if (!response.ok) throw new Error(`Decision failed with ${response.status}`);
  return response.json() as Promise<ContractWorkflow>;
}

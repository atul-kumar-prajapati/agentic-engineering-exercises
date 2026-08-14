export interface ContractWorkflow {
  id: string;
  customer: string;
  status: string;
  score: number;
  owner: string;
  note: string;
  decisionState: string;
}

export function parseWorkflowResponse(value: unknown): ContractWorkflow {
  if (typeof value !== "object" || value === null || !("decisionState" in value)
      || typeof value.decisionState !== "string") {
    throw new Error("Workflow response is missing decisionState");
  }

  return value as ContractWorkflow;
}

export async function listWorkflows(baseUrl = ""): Promise<ContractWorkflow[]> {
  const response = await fetch(`${baseUrl}/api/workflows`);
  if (!response.ok) throw new Error(`Workflow list failed with ${response.status}`);
  const values = await response.json() as unknown[];
  return values.map(parseWorkflowResponse);
}

export async function submitDecision(baseUrl: string, workflowId: string) {
  const response = await fetch(`${baseUrl}/api/workflows/${workflowId}/decisions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status: "Ready", owner: "Asha", evidenceNote: "Contract evidence attached" }),
  });
  if (!response.ok) throw new Error(`Decision failed with ${response.status}`);
  return parseWorkflowResponse(await response.json());
}

export interface Workspace {
  id: string;
  billingCustomerId: string;
  plan: "Starter" | "Growth" | "Enterprise";
  dataResidency: "standard" | "restricted";
}

export interface WorkspaceMembership {
  workspaceId: string;
  userId: string;
  role: "member" | "admin";
  status: "active" | "suspended";
}

export function canExportAIHistory(
  workspace: Workspace,
  membership: WorkspaceMembership | null | undefined,
): boolean {
  return (
    workspace.plan === "Enterprise" &&
    workspace.dataResidency === "standard" &&
    membership?.workspaceId === workspace.id &&
    membership.status === "active" &&
    membership.role === "admin"
  );
}

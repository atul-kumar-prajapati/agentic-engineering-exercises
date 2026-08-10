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

/**
 * Seeded previous-agent implementation. It follows the legacy `account owner`
 * vocabulary and therefore omits important workspace boundaries.
 */
export function canExportAIHistory(workspace: Workspace, membership: WorkspaceMembership) {
  return workspace.plan !== "Starter" && membership.role === "admin";
}

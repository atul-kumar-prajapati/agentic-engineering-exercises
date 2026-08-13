export interface BillingCustomer {
  id: string;
  ownerUserId: string;
}

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

export interface ExportAuthorizationContext {
  callerUserId: string;
  billingCustomer: BillingCustomer;
  workspace: Workspace;
  membership: WorkspaceMembership | null;
}

/**
 * Seeded previous-agent implementation. It follows the legacy `account owner`
 * rule and treats a role name as sufficient without checking its scope.
 */
export function canExportAIHistory(context: ExportAuthorizationContext) {
  const isLegacyAccountOwner = context.billingCustomer.ownerUserId === context.callerUserId;
  const hasAdminLabel = context.membership?.role === "admin";
  return context.workspace.plan !== "Starter" && (isLegacyAccountOwner || hasAdminLabel);
}

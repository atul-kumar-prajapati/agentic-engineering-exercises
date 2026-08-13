import type { TenantAccountLink } from "./billingTypes";

export function resolveBillingAccountId(tenantId: string, links: TenantAccountLink[]) {
  const link = links.find((candidate) => candidate.tenantId === tenantId);
  if (!link) throw new Error(`Missing billing-account mapping for tenant ${tenantId}`);
  return link.billingAccountId;
}

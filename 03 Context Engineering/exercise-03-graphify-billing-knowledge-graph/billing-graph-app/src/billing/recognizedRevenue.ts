export interface BillingEvent {
  tenantId: string;
  grossAmount: number;
  credits: number;
  kind: "charge" | "refund";
}

export interface TenantAccountLink {
  tenantId: string;
  billingAccountId: string;
}

export function recognizedRevenueByAccount(events: BillingEvent[], links: TenantAccountLink[]) {
  const accountByTenant = new Map(links.map((link) => [link.tenantId, link.billingAccountId]));

  return events.reduce<Record<string, number>>((totals, event) => {
    const billingAccountId = accountByTenant.get(event.tenantId);
    if (!billingAccountId) {
      throw new Error(`Missing billing account mapping for tenant ${event.tenantId}`);
    }

    const recognizedRevenue = event.kind === "refund" ? -event.grossAmount : event.grossAmount - event.credits;
    totals[billingAccountId] = (totals[billingAccountId] ?? 0) + recognizedRevenue;
    return totals;
  }, {});
}

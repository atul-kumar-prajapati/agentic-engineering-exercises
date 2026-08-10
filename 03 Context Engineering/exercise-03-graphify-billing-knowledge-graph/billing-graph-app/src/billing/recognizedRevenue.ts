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

/** Seeded shortcut: it ignores credits, refunds, and the tenant-to-account edge. */
export function recognizedRevenueByAccount(events: BillingEvent[], _links: TenantAccountLink[]) {
  return events.reduce<Record<string, number>>((totals, event) => {
    totals[event.tenantId] = (totals[event.tenantId] ?? 0) + event.grossAmount;
    return totals;
  }, {});
}

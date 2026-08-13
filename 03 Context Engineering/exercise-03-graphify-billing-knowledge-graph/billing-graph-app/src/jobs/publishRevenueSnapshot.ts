import type { BillingEvent, TenantAccountLink } from "../billing/billingTypes";
import { buildRevenueSummary } from "../billing/revenueSummary";

export function publishRevenueSnapshot(events: BillingEvent[], links: TenantAccountLink[]) {
  return {
    schemaVersion: 2,
    metrics: buildRevenueSummary(events, links),
  };
}

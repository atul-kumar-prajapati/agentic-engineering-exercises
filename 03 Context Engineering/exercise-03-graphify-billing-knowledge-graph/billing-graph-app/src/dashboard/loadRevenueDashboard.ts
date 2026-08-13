import type { BillingEvent, TenantAccountLink } from "../billing/billingTypes";
import { buildRevenueSummary } from "../billing/revenueSummary";

export function loadRevenueDashboard(events: BillingEvent[], links: TenantAccountLink[]) {
  return {
    generatedFor: "support-analytics",
    metrics: buildRevenueSummary(events, links),
  };
}

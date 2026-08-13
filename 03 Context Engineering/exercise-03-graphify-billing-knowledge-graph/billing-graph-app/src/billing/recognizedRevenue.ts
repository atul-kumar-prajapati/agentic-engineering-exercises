import type { BillingEvent, TenantAccountLink } from "./billingTypes";
import { resolveBillingAccountId } from "./tenantAccountDirectory";

/**
 * Seeded previous-agent implementation. It validates that a mapping exists but
 * still follows the legacy gross-by-tenant rule for the value and grouping key.
 */
export function recognizedRevenueByAccount(events: BillingEvent[], links: TenantAccountLink[]) {
  return events.reduce<Record<string, number>>((totals, event) => {
    resolveBillingAccountId(event.tenantId, links);
    totals[event.tenantId] = (totals[event.tenantId] ?? 0) + event.grossAmount;
    return totals;
  }, {});
}

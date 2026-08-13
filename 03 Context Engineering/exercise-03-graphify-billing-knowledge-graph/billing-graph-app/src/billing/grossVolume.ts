import type { BillingEvent, TenantAccountLink } from "./billingTypes";
import { resolveBillingAccountId } from "./tenantAccountDirectory";

/** Existing gross-volume metric. The incident fix must not change this behavior. */
export function grossVolumeByAccount(events: BillingEvent[], links: TenantAccountLink[]) {
  return events.reduce<Record<string, number>>((totals, event) => {
    const accountId = resolveBillingAccountId(event.tenantId, links);
    totals[accountId] = (totals[accountId] ?? 0) + event.grossAmount;
    return totals;
  }, {});
}

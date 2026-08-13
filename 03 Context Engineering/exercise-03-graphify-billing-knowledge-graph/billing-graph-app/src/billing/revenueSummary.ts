import type { BillingEvent, RevenueSummary, TenantAccountLink } from "./billingTypes";
import { grossVolumeByAccount } from "./grossVolume";
import { recognizedRevenueByAccount } from "./recognizedRevenue";

export function buildRevenueSummary(events: BillingEvent[], links: TenantAccountLink[]): RevenueSummary {
  return {
    recognizedRevenueByAccount: recognizedRevenueByAccount(events, links),
    grossVolumeByAccount: grossVolumeByAccount(events, links),
  };
}

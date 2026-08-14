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

export interface RevenueSummary {
  recognizedRevenueByAccount: Record<string, number>;
  grossVolumeByAccount: Record<string, number>;
}

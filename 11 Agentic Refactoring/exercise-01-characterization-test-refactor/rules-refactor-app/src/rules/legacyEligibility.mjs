const RENEWAL_DECISIONS = [
  {
    when: (account) => account.supportOverride === true,
    status: "eligible",
    discountPercent: 0,
    reason: "legacy-support-override",
  },
  {
    when: (account) => account.tier === "enterprise" && account.monthsActive >= 12 && account.latePayments < 2,
    status: "eligible",
    discountPercent: 15,
    reason: "enterprise-tenure",
  },
  {
    when: (account) => account.tier === "enterprise" && account.monthsActive >= 12,
    status: "manual-review",
    discountPercent: 0,
    reason: "payment-history",
  },
  {
    when: (account) => account.tier === "pro" && account.monthsActive >= 6 && account.latePayments === 0,
    status: "eligible",
    discountPercent: 10,
    reason: "pro-tenure",
  },
];

const PLAN_NOT_SUPPORTED = { status: "ineligible", discountPercent: 0, reason: "plan-not-supported" };

export function evaluateRenewalEligibility(account) {
  for (const decision of RENEWAL_DECISIONS) {
    if (decision.when(account)) {
      return { status: decision.status, discountPercent: decision.discountPercent, reason: decision.reason };
    }
  }
  return { ...PLAN_NOT_SUPPORTED };
}

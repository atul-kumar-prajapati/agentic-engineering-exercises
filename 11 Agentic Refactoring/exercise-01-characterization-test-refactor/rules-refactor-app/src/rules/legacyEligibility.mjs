const renewalRules = [
  {
    appliesTo: (account) => account.supportOverride === true,
    outcome: { status: "eligible", discountPercent: 0, reason: "legacy-support-override" },
  },
  {
    appliesTo: (account) =>
      account.tier === "enterprise" && account.monthsActive >= 12 && account.latePayments < 2,
    outcome: { status: "eligible", discountPercent: 15, reason: "enterprise-tenure" },
  },
  {
    appliesTo: (account) => account.tier === "enterprise" && account.monthsActive >= 12,
    outcome: { status: "manual-review", discountPercent: 0, reason: "payment-history" },
  },
  {
    appliesTo: (account) =>
      account.tier === "pro" && account.monthsActive >= 6 && account.latePayments === 0,
    outcome: { status: "eligible", discountPercent: 10, reason: "pro-tenure" },
  },
];

const unsupportedPlanOutcome = { status: "ineligible", discountPercent: 0, reason: "plan-not-supported" };

export function evaluateRenewalEligibility(account) {
  const matchedRule = renewalRules.find((rule) => rule.appliesTo(account));
  return { ...(matchedRule ? matchedRule.outcome : unsupportedPlanOutcome) };
}

export function evaluateRenewalEligibility(account) {
  let status = "ineligible";
  let discountPercent = 0;
  let reason = "plan-not-supported";
  if (account.supportOverride === true) {
    status = "eligible";
    reason = "legacy-support-override";
  } else if (account.tier === "enterprise") {
    if (account.monthsActive >= 12) {
      if (account.latePayments < 2) {
        status = "eligible";
        discountPercent = 15;
        reason = "enterprise-tenure";
      } else {
        status = "manual-review";
        reason = "payment-history";
      }
    }
  } else if (account.tier === "pro" && account.monthsActive >= 6 && account.latePayments === 0) {
    status = "eligible";
    discountPercent = 10;
    reason = "pro-tenure";
  }
  return { status, discountPercent, reason };
}

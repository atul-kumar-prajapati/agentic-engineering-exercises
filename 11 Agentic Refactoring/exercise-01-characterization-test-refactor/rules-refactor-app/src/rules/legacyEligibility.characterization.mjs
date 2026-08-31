import { evaluateRenewalEligibility } from "./legacyEligibility.mjs";

function preRefactorBaseline(account) {
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

const tiers = ["enterprise", "pro", "basic", "Enterprise", "", undefined];
const monthsActiveValues = [undefined, null, -3, 0, 5, 6, 11, 12, 13, 100, 6.5, "12", "abc", true, false];
const latePaymentValues = [undefined, null, -5, -1, 0, 1, 1.5, 2, 7, "1", "0", "abc", false, true];
const supportOverrideValues = [undefined, true, false, "true", 1, null, 0];

const frozenBehaviorCases = [
  {
    name: "support override forces eligibility with zero discount",
    account: { tier: "pro", monthsActive: 48, latePayments: 0, supportOverride: true },
    expected: { status: "eligible", discountPercent: 0, reason: "legacy-support-override" },
  },
  {
    name: "support override wins even for otherwise ineligible accounts",
    account: { tier: "basic", monthsActive: 1, latePayments: 9, supportOverride: true },
    expected: { status: "eligible", discountPercent: 0, reason: "legacy-support-override" },
  },
  {
    name: "truthy but not strictly-true support override is ignored",
    account: { tier: "pro", monthsActive: 48, latePayments: 0, supportOverride: "true" },
    expected: { status: "eligible", discountPercent: 10, reason: "pro-tenure" },
  },
  {
    name: "explicitly false support override falls through to tier rules",
    account: { tier: "enterprise", monthsActive: 14, latePayments: 0, supportOverride: false },
    expected: { status: "eligible", discountPercent: 15, reason: "enterprise-tenure" },
  },
  {
    name: "enterprise with 12 months and no late payments is eligible at 15 percent",
    account: { tier: "enterprise", monthsActive: 12, latePayments: 0 },
    expected: { status: "eligible", discountPercent: 15, reason: "enterprise-tenure" },
  },
  {
    name: "enterprise with a single late payment stays eligible at 15 percent",
    account: { tier: "enterprise", monthsActive: 24, latePayments: 1 },
    expected: { status: "eligible", discountPercent: 15, reason: "enterprise-tenure" },
  },
  {
    name: "enterprise accepts negative late-payment counts",
    account: { tier: "enterprise", monthsActive: 14, latePayments: -3 },
    expected: { status: "eligible", discountPercent: 15, reason: "enterprise-tenure" },
  },
  {
    name: "enterprise with two late payments goes to manual review",
    account: { tier: "enterprise", monthsActive: 12, latePayments: 2 },
    expected: { status: "manual-review", discountPercent: 0, reason: "payment-history" },
  },
  {
    name: "enterprise with many late payments goes to manual review",
    account: { tier: "enterprise", monthsActive: 30, latePayments: 5 },
    expected: { status: "manual-review", discountPercent: 0, reason: "payment-history" },
  },
  {
    name: "enterprise with undefined late payments lands in manual review",
    account: { tier: "enterprise", monthsActive: 18 },
    expected: { status: "manual-review", discountPercent: 0, reason: "payment-history" },
  },
  {
    name: "mature enterprise account under 12 months is rejected as plan-not-supported",
    account: { tier: "enterprise", monthsActive: 11, latePayments: 0 },
    expected: { status: "ineligible", discountPercent: 0, reason: "plan-not-supported" },
  },
  {
    name: "pro with 6 months and clean payments is eligible at 10 percent",
    account: { tier: "pro", monthsActive: 6, latePayments: 0 },
    expected: { status: "eligible", discountPercent: 10, reason: "pro-tenure" },
  },
  {
    name: "pro with long tenure and clean payments is eligible at 10 percent",
    account: { tier: "pro", monthsActive: 36, latePayments: 0 },
    expected: { status: "eligible", discountPercent: 10, reason: "pro-tenure" },
  },
  {
    name: "pro does not accept negative late-payment counts",
    account: { tier: "pro", monthsActive: 6, latePayments: -1 },
    expected: { status: "ineligible", discountPercent: 0, reason: "plan-not-supported" },
  },
  {
    name: "mature pro with one late payment is rejected as plan-not-supported",
    account: { tier: "pro", monthsActive: 8, latePayments: 1 },
    expected: { status: "ineligible", discountPercent: 0, reason: "plan-not-supported" },
  },
  {
    name: "pro under 6 months is rejected as plan-not-supported",
    account: { tier: "pro", monthsActive: 5, latePayments: 0 },
    expected: { status: "ineligible", discountPercent: 0, reason: "plan-not-supported" },
  },
  {
    name: "unsupported tier is rejected as plan-not-supported regardless of maturity",
    account: { tier: "basic", monthsActive: 60, latePayments: 0 },
    expected: { status: "ineligible", discountPercent: 0, reason: "plan-not-supported" },
  },
  {
    name: "account with no fields at all is rejected as plan-not-supported",
    account: {},
    expected: { status: "ineligible", discountPercent: 0, reason: "plan-not-supported" },
  },
  {
    name: "numeric string monthsActive is coerced for enterprise",
    account: { tier: "enterprise", monthsActive: "12", latePayments: 0 },
    expected: { status: "eligible", discountPercent: 15, reason: "enterprise-tenure" },
  },
  {
    name: "numeric string latePayments is coerced for enterprise",
    account: { tier: "enterprise", monthsActive: 14, latePayments: "1" },
    expected: { status: "eligible", discountPercent: 15, reason: "enterprise-tenure" },
  },
  {
    name: "numeric string latePayments is strictly rejected for pro",
    account: { tier: "pro", monthsActive: 14, latePayments: "0" },
    expected: { status: "ineligible", discountPercent: 0, reason: "plan-not-supported" },
  },
];

const failures = [];
let compared = 0;

function compareOutcome(label, account, expected) {
  const actual = evaluateRenewalEligibility(account);
  compared += 1;
  if (
    actual.status !== expected.status ||
    actual.discountPercent !== expected.discountPercent ||
    actual.reason !== expected.reason
  ) {
    failures.push({ label, account, expected, actual });
  }
}

for (const tier of tiers) {
  for (const monthsActive of monthsActiveValues) {
    for (const latePayments of latePaymentValues) {
      for (const supportOverride of supportOverrideValues) {
        const full = { tier, monthsActive, latePayments, supportOverride };
        const sparse = {};
        for (const [key, value] of Object.entries(full)) {
          sparse[key] = value;
        }
        compareOutcome(`grid full ${JSON.stringify(full)}`, full, preRefactorBaseline(full));
        compareOutcome(`grid sparse ${JSON.stringify(sparse)}`, sparse, preRefactorBaseline(sparse));
      }
    }
  }
}

for (const { name, account, expected } of frozenBehaviorCases) {
  compareOutcome(`documented case "${name}" against pinned expectation`, account, expected);
  compareOutcome(`documented case "${name}" against pre-refactor baseline`, account, preRefactorBaseline(account));
}

const sampleAccount = { tier: "enterprise", monthsActive: 20, latePayments: 1 };
const firstResult = evaluateRenewalEligibility(sampleAccount);
const secondResult = evaluateRenewalEligibility(sampleAccount);
compared += 3;
if (firstResult === secondResult) {
  failures.push({ label: "each call must return a fresh object", account: sampleAccount });
}
firstResult.status = "tampered";
firstResult.discountPercent = 999;
if (secondResult.status !== "eligible" || secondResult.discountPercent !== 15) {
  failures.push({ label: "mutating one returned object must not affect another", account: sampleAccount });
}
const thirdResult = evaluateRenewalEligibility(sampleAccount);
if (thirdResult.status !== "eligible" || thirdResult.discountPercent !== 15) {
  failures.push({ label: "mutating a returned object must not affect later calls", account: sampleAccount });
}

for (const badAccount of [null, undefined]) {
  compared += 1;
  let baselineThrew = false;
  let currentThrew = false;
  try {
    preRefactorBaseline(badAccount);
  } catch {
    baselineThrew = true;
  }
  try {
    evaluateRenewalEligibility(badAccount);
  } catch {
    currentThrew = true;
  }
  if (!baselineThrew || !currentThrew) {
    failures.push({ label: `null or undefined account must keep throwing`, account: badAccount });
  }
}

if (failures.length > 0) {
  console.error(`characterization FAILED: ${failures.length} mismatch(es) out of ${compared} comparisons`);
  for (const failure of failures.slice(0, 25)) {
    console.error(JSON.stringify(failure));
  }
  process.exitCode = 1;
} else {
  console.log(
    `characterization PASSED: ${compared} comparisons across ${frozenBehaviorCases.length} documented behaviors, ` +
      `all outputs identical to the pre-refactor baseline`
  );
}

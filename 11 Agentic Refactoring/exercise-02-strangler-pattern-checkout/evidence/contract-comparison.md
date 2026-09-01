# Contract comparison

Public request fields are `orderId`, `paymentType`, `subtotalCents`, `taxRateBps`, and optional `paymentToken`. Every result contains exactly `orderId`, `status`, `totalCents`, and `errorCode` (`docs/checkout-contract.md:5-7`).

`totalCents` is `subtotalCents + Math.round(subtotalCents * taxRateBps / 10000)`. Both the protected legacy path (`legacyCheckout.mjs:1-2`) and the new card slice (`cardCheckout.mjs:3-8`) use that formula. Independent check: `1001 + Math.round(1001 * 825 / 10000) = 1084`; `4200 + Math.round(4200 * 500 / 10000) = 4410`.

## Approved

Fixture `docs/checkout-cases.json:2` (`ord-card-ok`, token `tok-ok`, `authorization.approved: true`).

Expected: `{ orderId: "ord-card-ok", status: "paid", totalCents: 1084, errorCode: null }`.

Card slice maps `authorization.approved === true` to that paid result (`cardCheckout.mjs:11-13`). Protected test `run-checkout-tests.mjs:19-22` asserts `cardResult === legacyResult === expected` and a single `authorize` payload `{ orderId, amountCents: 1084, paymentToken }`.

## Declined

Fixture `docs/checkout-cases.json:3` (`ord-card-no`, token `tok-no`, `authorization.approved: false`).

Expected: `{ orderId: "ord-card-no", status: "failed", totalCents: 4410, errorCode: "PAYMENT_DECLINED" }`.

Card slice maps any non-true `approved` to `PAYMENT_DECLINED` (`cardCheckout.mjs:15`). Strings `paid`, `failed`, `PAYMENT_DECLINED`, and `PAYMENT_STATE_UNKNOWN` are preserved as literals, not paraphrased.

No public-field drift between legacy and the new slice on the two protected cases.

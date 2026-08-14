# Checkout Contract

## Public request and result

A request contains `orderId`, `paymentType`, `subtotalCents`, `taxRateBps`, and optional `paymentToken`. Every result contains exactly `orderId`, `status`, `totalCents`, and `errorCode`.

`totalCents` is `subtotalCents + Math.round(subtotalCents * taxRateBps / 10000)`. Preserve the strings `paid`, `failed`, `PAYMENT_DECLINED`, and `PAYMENT_STATE_UNKNOWN`.

## Route boundary

- `card` with `cardSliceEnabled: true`: new card slice.
- `card` with the flag false: legacy.
- `gift-card`, `invoice`, and unknown types: legacy for compatibility.
- The router receives `legacy`, `card`, and `cardSliceEnabled` through one injectable dependency object.

## Authorization safety

The card slice calls `authorize` once with `orderId`, `amountCents`, and `paymentToken`. Approved and declined responses must match the legacy public result.

If the new slice throws with `authorizationCreated: false`, the router may call legacy once. If the value is true, missing, or ambiguous, legacy must not run; return the error's public `result` when valid, otherwise return `PAYMENT_STATE_UNKNOWN` with the calculated total.

The legacy implementation remains available as the immediate rollback path.

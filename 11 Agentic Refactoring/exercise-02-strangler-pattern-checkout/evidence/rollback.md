# Rollback and authorization safety

Immediate rollback is `cardSliceEnabled: false`. The router then never enters the card try/catch (`checkoutRouter.mjs:5-6,28-29`). Flag-off card uses legacy only (`run-checkout-tests.mjs:55-58`). `legacyCheckout.mjs` is untouched (protected, blob identical to `52090ed`). Deleting it would break rollback and the safe pre-authorization fallback.

## Safe fallback

If the new slice throws with `authorizationCreated: false`, the router calls legacy once (`checkoutRouter.mjs:35-36`). Protected proof: `run-checkout-tests.mjs:60-62` expects `{ legacy: ["card"], card: ["card"] }`.

## No duplicate authorization

If `authorizationCreated` is true, missing, or ambiguous, legacy must not run. The router returns `error.result` when it is a valid public result, otherwise `PAYMENT_STATE_UNKNOWN` with the calculated total (`checkoutRouter.mjs:38-41`; `docs/checkout-contract.md:20`).

Protected unsafe shapes (`run-checkout-tests.mjs:64-73`):

1. `{ authorizationCreated: true, result }`
2. `{ result }` (flag missing)
3. `new Error("gateway outcome unknown")`

All three: `{ legacy: [], card: ["card"] }`. No duplicate charge path through legacy after an uncertain or completed authorization.

`createCardCheckout` calls `authorize` once (`cardCheckout.mjs:25-29`) and does not rewrite failures as `authorizationCreated: false`. Untagged `authorize` throws fail closed at the router instead of retrying the legacy gateway.

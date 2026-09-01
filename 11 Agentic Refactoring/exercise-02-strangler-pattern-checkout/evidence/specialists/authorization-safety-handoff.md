# Authorization-safety handoff

Reviewer: cursor-grok-4.6-high. Artifact: after commit `58878e4215a164c7a445bd4399118625e894d5e3`. `npm run test:checkout` exit 0 (integration owner re-ran).

Verdict: PASS. No accepted defects.

| id | disposition | file:line | claim | Integration note |
|---|---|---|---|---|
| AS-dismiss-error-only | dismiss | `checkoutRouter.mjs:35-36` | Catch requires `Error` | Plain `{ authorizationCreated: false }` is accepted; protected `run-checkout-tests.mjs:60-62` uses that object |
| AS-dismiss-string-throw | dismiss | `checkoutRouter.mjs:35-41` | String throw should fall back | Contract requires the property. String throw fail-closes with zero legacy |
| AS-dismiss-retag | dismiss | `cardCheckout.mjs:23-30` | Slice must tag throws for protected tests | Protected tests inject at `implementations.card` (`run-checkout-tests.mjs:38`). Retagging after `authorize` returns is the before duplicate-auth hole |
| AS-dismiss-coercion | dismiss | `checkoutRouter.mjs:35` | `0` or `"false"` should fall back | Ambiguous; strict `=== false` is the contract |
| AS-dismiss-false-plus-result | dismiss | `checkoutRouter.mjs:35-36` | `false` plus `result` should return `result` | Proven pre-auth failure may call legacy; first branch wins |
| AS-dismiss-dead-fallback | dismiss | `cardCheckout.mjs:23-30` | Slice never emits `authorizationCreated: false` | Router owns the flag; injection-point throws exercise it |
| AS-dismiss-approved-strict | dismiss | `cardCheckout.mjs:12` | Strict `approved === true` vs legacy truthy | Fixtures are booleans; protected comparisons pass |
| AS-dismiss-typeof-card | dismiss | `checkoutRouter.mjs:32-33` | Missing card function | `TypeError` → unknown, no legacy. Fail-closed |

## Paths proved

1. Safe fallback once: `checkoutRouter.mjs:35-36`; `run-checkout-tests.mjs:60-62`
2. `authorizationCreated: true`: `checkoutRouter.test.mjs:121-136`; `run-checkout-tests.mjs:65-73`
3. Missing flag: `checkoutRouter.test.mjs:138-153`
4. `Error`: `checkoutRouter.test.mjs:155-174`; `unknownPaymentState` at `checkoutRouter.mjs:18-24,41`
5. Authorize once: `cardCheckout.mjs:25-29`; `run-checkout-tests.mjs:23-29`
6. Unsafe never retries legacy: `checkoutRouter.mjs:35-36` is the only legacy site in the catch, gated on `=== false`

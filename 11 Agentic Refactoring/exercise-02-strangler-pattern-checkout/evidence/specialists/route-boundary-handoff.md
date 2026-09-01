# Route-boundary handoff

Reviewer: cursor-grok-4.6-high. Artifact: after worktree commit `58878e4215a164c7a445bd4399118625e894d5e3`. Protected citations: `run-checkout-tests.mjs` on that tree (= `52090ed`). `npm run test:checkout` exit 0 (integration owner re-ran).

Verdict: PASS. No accepted defects.

| id | disposition | file:line | claim | Integration note |
|---|---|---|---|---|
| RB-1 | dismiss | `checkoutRouter.test.mjs:62-104` | Participant non-card tests assert call vectors, not payloads | Call vector is the routing proof; protected tests use the same pattern at `run-checkout-tests.mjs:49-58` |
| RB-2 | dismiss | `checkoutRouter.test.mjs:39-60` | Learner tests skip declined 4410 through the router | Protected fixtures cover declined rounding (`checkout-cases.json:3`, `run-checkout-tests.mjs:13-22`) |
| RB-3 | dismiss | `checkoutRouter.mjs:5-6` | `gift-card` contains substring `card` | Predicate is `=== "card"`, proven at `checkoutRouter.test.mjs:62-70` |
| RB-4 | dismiss | BEFORE `checkoutRouter.mjs` typeof-card guard | After omits the function check | Before extras are not after defects; missing `card` fail-closes |

## Paths proved

1. Enabled card → new slice: `checkoutRouter.mjs:5-6,28-33`; `run-checkout-tests.mjs:45-47`
2. Gift-card → legacy: `run-checkout-tests.mjs:49-52`; `checkoutRouter.test.mjs:62-70`
3. Invoice → legacy: `checkoutRouter.test.mjs:73-81`
4. Unknown crypto → legacy: `checkoutRouter.test.mjs:84-92`
5. Flag off → legacy: `run-checkout-tests.mjs:55-58`; `checkoutRouter.test.mjs:95-103`
6. Rounding 1084 / 4410: `cardCheckout.mjs:3-8,11-15`; `checkout-cases.json:2-3`

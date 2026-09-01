# Comparison

## Same conditions

Both first attempts used starting commit `52090edddf032d026ece16ef90feb627bf8e67ac`, agent/model `cursor / cursor-grok-4.6-high`, Cursor worktrees, npm in `checkout-strangler-app`, 45-minute limit, human hints 0, retries 0. Patches are `git diff --binary --full-index <starting-commit> <implementation-commit>`.

The after run received the repo contracts only. It did not receive the previous implementation, before.patch, or any explanation of the first attempt.

## Before

Unconstrained extraction prompt. Implementation `f2f3646c5f104576294b0513538381ba1a75736f`. `evidence/before.patch` SHA-256 `a15e9f3d20f132e54f28346915d3be34edba30a1b311112e08551a70ca42c4f5`. `npm run test:checkout` exit 0.

This baseline was already a passing card-only strangler: gift-card, invoice, unknown, and flag-off stayed legacy; safe fallback and unsafe no-fallback matched the protected matrix. Do not degrade it.

The unconstrained slice still wraps a non-object `authorize` throw as `{ authorizationCreated: false }`, which can send the router into legacy after `authorize` has already run. That is a duplicate-authorization hole the protected tests do not hit.

## After

Contract-backed implementation `58878e4215a164c7a445bd4399118625e894d5e3` (also `sourceSha`). `evidence/after.patch` SHA-256 `694b556fe7b3e7ea5c6543ca768c096c6a02932de17d8c086aea95767d6b4566`. `npm run test:checkout` exit 0. `after.patch` is the unaided after diff; integration fast-forwarded that commit rather than rewriting blobs.

The independent variable is the route contract as extra input plus Git-bound `sourceSha` / evidence, not measured routing quality. Both attempts passed the same protected matrix.

Observable difference: after `createCardCheckout` does not retag throws, so untagged failures stay fail-closed (`PAYMENT_STATE_UNKNOWN`, zero legacy).

## Proof

| Route | Before | After | Protected citation |
|---|---|---|---|
| card, flag on | new slice | new slice | `run-checkout-tests.mjs:45-47` |
| gift-card | legacy | legacy | `run-checkout-tests.mjs:49-52` |
| invoice | legacy | legacy | `run-checkout-tests.mjs:49-52` |
| unknown | legacy | legacy | `run-checkout-tests.mjs:49-52` |
| flag-off | legacy | legacy | `run-checkout-tests.mjs:55-58` |
| safe-fallback | card then legacy once | card then legacy once | `run-checkout-tests.mjs:60-62` |
| unsafe-fallback | no legacy | no legacy | `run-checkout-tests.mjs:64-73` |

Starting tree without `cardCheckout.mjs`: `npm run test:checkout` exit 1 at `run-checkout-tests.mjs:10`. Fixed tree: exit 0.

## Conclusion

Adopt the after implementation as `sourceSha`. Both attempts cleared the public contract and the seven named routes. Keep the before baseline honest. Ship after because it fail-closes untagged authorization failures and because only a Git-bound three-file source commit plus evidence can be verified.

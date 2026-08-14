# Exercise 02 : Strangler Checkout Route

## Your Mission

Your team needs card checkout moved out of a legacy payment path without moving other consumers or risking duplicate authorization. Your mission is to introduce one safe strangler seam while preserving the complete public contract.

Card, gift-card, invoice, and unknown payment types currently share one implementation. A broad rewrite or unsafe fallback can change unrelated behavior or authorize a payment twice.

Compare an unconstrained extraction with a contract-backed card-only route and prove the fallback boundary.

The duration for this challenge is 45 min or less.

## Project

[checkout-strangler-app](./checkout-strangler-app) contains the all-legacy router and protected tests. The [checkout contract](./docs/checkout-contract.md) defines public fields, rounding, routes, and failure behavior.

## How To Go About It

1. Create two branches from the same starting commit. In the first branch, give a fresh coding agent the card-extraction request without the route contract. Do not correct or retry it. Save `evidence/before.md` and `evidence/before.patch`.

2. Review whether the result moves non-card consumers, changes public values, couples dependencies, or can fall back after an uncertain authorization.

3. In the second branch, create `cardCheckout.mjs` and characterize its approved and declined results against legacy behavior.

4. Start another fresh agent session under the same agent, model, tools, permissions, request, time limit, and first-attempt conditions. Update `checkoutRouter.mjs` so only enabled card requests use the injectable new slice.

5. A new-card failure may fall back only when the error proves no authorization was created. Ambiguous or post-authorization failures must return the established failure result without calling legacy checkout.

6. Prove gift-card, invoice, unknown, flag-off, safe-fallback, and unsafe-no-fallback routes with participant tests. Do not delete or rewrite the legacy path.

7. Commit the router, card slice, and test together. Save `evidence/after.md`, `evidence/after.patch`, route matrix, contract comparison, rollback, history, and final comparison.

## Evidence

Submit:

- The router, card slice, and participant tests.
- `evidence/before.md`, `evidence/before.patch`, `evidence/after.md`, and `evidence/after.patch`.
- `route-matrix.md`, `contract-comparison.md`, `rollback.md`, `history.json`, and `evidence/comparison.md`.
- Captured command output and output from `npm run verify:exercise`.
- A focused pull request containing only this exercise.

Run `npm run verify:exercise` before raising the PR. It checks protected inputs, application quality, exact checkout contract, card-only routing, injectable seams, failure fallback, source scope, history, and required proof.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- Both agent attempts use matching conditions and genuine first-attempt patches.
- Only enabled card requests reach the new slice; every other request remains legacy.
- Public fields and rounding stay unchanged, dependencies are injectable, and rollback is explicit.
- Safe pre-authorization failures may fall back, while uncertain or completed authorizations never retry through legacy.
- `npm run verify:exercise` passes and the source commit contains only the router, card slice, and participant test.

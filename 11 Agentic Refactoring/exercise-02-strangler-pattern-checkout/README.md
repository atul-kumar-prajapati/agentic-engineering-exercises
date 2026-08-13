# Exercise 02 : Strangler Checkout Route

## Your Mission

Your mission is to move card checkout to a new implementation without rewriting gift-card and invoice checkout paths.

You are given a legacy checkout entry point used by all payment types. A big-bang replacement risks changing totals, error codes, and unsupported payment behavior.

Introduce one routing seam, send only card checkout through the new slice, and preserve the public result for every protected case.

The duration for this challenge is 30 min or less.

## Project

[checkout-strangler-app](./checkout-strangler-app) contains the legacy entry point and seeded all-legacy router. [checkout contract](./docs/checkout-contract.md) defines routing and observable behavior.

## How To Go About It

Characterize the legacy public contract first. Create a card-specific module and route only eligible card requests through it using an explicit seam or flag.

Keep gift-card and invoice calls on the legacy implementation. Record fallback and rollback behavior, and do not delete the old path while it still has consumers.

## Evidence

Submit the new slice, router, and tests, `evidence/route-matrix.md`, `evidence/contract-comparison.md`, and `evidence/rollback.md`.

Run `npm run test:checkout`, `npm run test:submission`, and `npm run agent:check` from `checkout-strangler-app`.

Raise a focused PR containing only this exercise. Follow the [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

Reviewers will check one explicit routing seam, new-card routing, legacy gift-card and invoice routing, unchanged public results, failure fallback, and rollback.

The exercise is incomplete if all checkout paths are rewritten, the legacy path is deleted, behavior changes are hidden as refactoring, or route selection is untested.

See the [Strangler Checkout Route rubric](../../docs/EVALUATION_RUBRICS.md#strangler-checkout-route).

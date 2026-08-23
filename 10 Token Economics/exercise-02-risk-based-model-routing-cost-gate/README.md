# Exercise 02 : Risk-Based Model Routing Cost Gate

## Your Mission

Your team sends every coding task to its most expensive reasoning model because it has no safe routing policy. Your mission is to reduce cost without sending risky or unclear work to an unsuitable model.

A cheap replacement can look efficient while failing security work, hiding retry costs, or executing requests that should be clarified first.

Build a field-based router, measure every eligible route from a protected recorded pack, and adopt it only when quality, safety, latency, and total expected cost pass the gate.

The duration for this challenge is 60 min or less.

## Project

[model-routing-app](./model-routing-app) contains the all-reasoning router, a real application consumer, and the protected scorer. Cases, 36 deterministic benchmark observations, quality floors, and pricing live under `evals/`. The fixtures are synthetic and reproducible; they are not presented as production model telemetry. The [routing policy contract](./docs/routing-policy-contract.md) defines precedence and the [measurement contract](./docs/measurement-contract.md) defines valid proof.

## How To Go About It

1. Record the all-reasoning baseline, starting commit, router patch, and measured cost in `evidence/before.md` and `evidence/before.patch`.

2. Implement `fast`, `balanced`, `reasoning`, and `clarify` routes from task risk, ambiguity, and scope. Do not route by case ID or wording copied from fixtures.

3. High ambiguity or missing risk must clarify without model execution. High-risk work must use reasoning. The router must pass unseen field permutations.

4. Use `evals/recorded-runs.json` for every eligible case and tier pair. Derive `evidence/routing-measurements.json` from its raw responses, hashes, token counts, latency, quality, and safety results. Do not edit the protected pack.

5. Include the expected cost and latency of retries or escalations for low-quality or unsafe first calls. Do not average away any security failure.

6. Commit the router and tests first. Record that SHA in `measurement-run.json`, run the protected scorer, and reconcile every cost to the benchmark tokens and protected pricing. Add evidence in a later evidence-only commit.

7. Write the routing policy, adoption decision, and comparison. Adopt only if every quality and safety floor passes and expected cost is at least 25 percent below all-reasoning.

## Evidence

Submit:

- The router and learner tests.
- `evidence/before.md`, `evidence/before.patch`, `evidence/after.md`, and `evidence/after.patch`.
- Response-bound measurements, pack metadata, and generated `cost-model.json`.
- `routing-policy.md`, `adoption.md`, and `evidence/comparison.md`.
- Output from `npm run verify:exercise`.
- A focused pull request containing only this exercise.

Run `npm run verify:exercise` before raising the PR. It checks protected inputs, router behavior, real-run completeness, response hashes, quality and safety gates, retry economics, cost reconciliation, and required proof.

Verification is fully offline. A live provider run is optional exploration only and is not accepted as a replacement for the protected pack.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- Routing depends only on task fields and passes unseen permutations.
- Ambiguous or missing-risk tasks clarify, high-risk tasks use reasoning, and every executable lane has three protected benchmark observations.
- Raw hashes, tokens, pricing, retries, escalations, latency, quality, and safety recompute exactly.
- Every selected route passes its floors and expected cost is at least 25 percent below all-reasoning.
- `npm run verify:exercise` passes and the adoption decision matches the generated scorecard.

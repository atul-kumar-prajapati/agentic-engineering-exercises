# Exercise 02 : Feature Flag Kill-Switch Proof

## Your Mission

Your mission is to prove that a risky invoice preview can be disabled without calling its new API or emitting misleading telemetry.

You are given a seeded implementation where the disabled path still calls the preview service, evaluation errors fail open, and rollback leaves the new telemetry active.

Implement a provider-independent feature-flag boundary, verify enabled and disabled behavior, and perform a timed rollback drill.

The duration for this challenge is 30 min or less.

## Project

[feature-flag-app](./feature-flag-app) contains the rollout boundary. [flag brief](./docs/flag-brief.md) defines defaults, evaluation context, telemetry, and rollback expectations.

## How To Go About It

Use [OpenFeature](https://openfeature.dev/) or an equivalent abstraction. Default safely when evaluation fails, keep a stable targeting key, and ensure the disabled path uses the legacy view without calling the new service.

Test enabled, disabled, provider-error, and rollback states. Record the flag change, observable result, elapsed rollback time, and remaining cleanup work.

## Evidence

Submit the implementation and tests, `evidence/enabled.json`, `evidence/disabled.json`, and `evidence/rollback-drill.md` using the supplied template.

Run `npm run test:rollout`, `npm run test:submission`, and `npm run agent:check` from `feature-flag-app`.

Raise a focused PR containing only this exercise. Follow the [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

Reviewers will check safe defaults, stable targeting, API suppression, telemetry accuracy, both flag states, and a reproducible rollback drill.

The exercise is incomplete if disabled users still reach the new API, evaluation errors enable the feature, rollback evidence is descriptive only, or protected inputs change.

See the [Feature Flag Kill-Switch Proof rubric](../../docs/EVALUATION_RUBRICS.md#feature-flag-kill-switch-proof).

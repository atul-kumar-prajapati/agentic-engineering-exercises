# Exercise 02 : Risk-Based Model Routing Cost Gate

## Your Mission

Your mission is to reduce agent cost without routing high-risk or ambiguous work to a model that cannot complete it safely.

You are given a router that sends every task to the most expensive tier. The protected task set includes mechanical edits, bounded code changes, security-sensitive work, and requests that must be clarified before execution.

Build and evaluate a routing policy using measured quality, escalation, latency, and cost rather than model reputation.

The duration for this challenge is 30 min or less.

## Project

[model-routing-app](./model-routing-app) contains the seeded router. Protected cases and pricing live under `evals/`.

## How To Go About It

Define fast, balanced, reasoning, and clarify routes. Run each task three times on every eligible tier and grade it against the supplied assertions.

Implement the smallest policy that meets quality and safety floors. Calculate expected cost from measured routing outcomes and include retry and escalation cost, not only first-call price.

## Evidence

Submit the router and tests, raw run results, `evidence/routing-policy.md`, `evidence/cost-model.json`, and `evidence/adoption.md` with quality, cost, latency, variance, and exceptions.

Run `npm run test:routing`, `npm run eval:fixtures`, `npm run test:submission`, and `npm run agent:check` from `model-routing-app`.

Raise a focused PR containing only this exercise. Follow the [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

Reviewers will check safe escalation, clarification handling, three-run measurements, pricing math, retry cost, quality floors, and held-out routing behavior.

The exercise is incomplete if every task uses one tier, security work is downgraded for cost, ambiguous work executes without clarification, or savings are based on list price alone.

See the [Risk-Based Model Routing Cost Gate rubric](../../docs/EVALUATION_RUBRICS.md#risk-based-model-routing-cost-gate).

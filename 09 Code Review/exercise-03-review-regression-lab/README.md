# Exercise 03 : Code Review Regression Gate

## Your Mission

Your mission is to decide whether an improved review prompt catches historical defects without turning harmless changes into false blockers.

You are given one historical bad diff, a multi-bug diff, a clean look-alike control, and baseline and candidate prompts. A longer checklist can improve recall while destroying review precision.

Run repeated model reviews, improve the candidate from observed failures, and make an adoption decision using both recall and clean-control precision.

The duration for this challenge is 30 min or less.

## Project

[regression-review-app](./regression-review-app) contains protected cases, prompts, a structural check, and model-evaluation configuration. [adoption thresholds](./docs/adoption-thresholds.md) define the gate.

## How To Go About It

Run the same model and settings against baseline and candidate prompts at least three times per case. Report historical recall, multi-bug recall, clean-control precision, and variance.

Improve general review behavior without naming case IDs, exact diff tokens, or expected findings. Select the candidate using held-out results and record limitations.

## Evidence

Submit the final prompt, raw evaluation outputs, and `evidence/review-eval.md` containing model, settings, sample count, scores, variance, false blockers, limitations, and adoption decision.

Run `npm run eval:smoke`, `npm run eval:model`, `npm run test:submission`, and `npm run agent:check` from `regression-review-app`.

Raise a focused PR containing only this exercise. Follow the [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

Reviewers will check real model runs, repeated samples, multi-bug coverage, clean controls, threshold calculations, and absence of answer leakage.

The exercise is incomplete if only keyword checks run, provider logic contains answers, sample details are missing, or higher recall creates unacceptable false blockers.

See the [Code Review Regression Gate rubric](../../docs/EVALUATION_RUBRICS.md#code-review-regression-gate).

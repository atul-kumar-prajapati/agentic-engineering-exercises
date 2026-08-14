# Exercise 03 : Code Review Regression Gate

## Your Mission

Your team wants a stronger code-review prompt, but an overcautious reviewer can appear thorough while creating false merge blockers. Your mission is to improve review recall without sacrificing clean-control precision.

The protected catalog contains a historical five-bug diff, a two-bug security diff, and a clean look-alike. The starter candidate is deliberately noisy.

Run a repeated real-model baseline and candidate evaluation, improve only from measured training failures, and make an evidence-based adoption decision.

The duration for this challenge is 60 min or less.

## Project

[regression-review-app](./regression-review-app) contains protected cases, Promptfoo configuration, scorer, and evidence verifier. [Adoption thresholds](./docs/adoption-thresholds.md) and the [judgment contract](./docs/judgment-contract.md) define the gate.

## How To Go About It

1. Record the starting commit and baseline prompt in `evidence/before.md` and `evidence/before.patch`. Set `REVIEW_EVAL_MODEL` to a real remote model provider.

2. Run the protected catalog check, then evaluate the baseline and unchanged candidate without cache, three times per case under identical provider settings.

3. Bind every judgment to its raw response hash and score against protected finding IDs. Do not replace the provider with deterministic code or expose case IDs, expected findings, file hints, or diff tokens to the candidate.

4. Improve only `eval/review-prompt-candidate.md` from training failures. Do not tune against held-out results.

5. Rerun all 18 candidate samples with the same model, temperature, cases, repository state, and first-attempt conditions. Do not selectively rerun weak responses.

6. Generate the scorecard and compare recall, precision, false blockers, variance, and regression limits. Use the thresholds to adopt or reject the candidate.

7. Save `evidence/after.md`, `evidence/after.patch`, raw results, judgments, scorecard, report, and comparison. Raise a focused PR containing only the candidate and evidence.

## Evidence

Submit:

- The final candidate prompt and its focused source commit.
- `evidence/before.md`, `evidence/before.patch`, `evidence/after.md`, and `evidence/after.patch`.
- Raw Promptfoo output, run metadata, response-bound judgments, and generated scorecard.
- `evidence/review-eval.md` and `evidence/comparison.md`.
- Output from `npm run verify:exercise`.
- A focused pull request containing only this exercise.

Run `npm run verify:exercise` before raising the PR. It checks protected inputs, real-model metadata, uncached sample completeness, response-bound judgments, generated scores, thresholds, prompt leakage, and required proof.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- Both prompt lanes use the same real provider, model, temperature, cases, and three uncached samples per case.
- Historical and multi-bug recall each reach 80 percent and clean-control precision reaches 90 percent.
- No metric regresses by more than five percentage points and the prompt contains no fixture answers.
- Every judgment matches a raw response hash and the report matches the generated scorecard.
- `npm run verify:exercise` passes and the adoption decision follows the measured gate.

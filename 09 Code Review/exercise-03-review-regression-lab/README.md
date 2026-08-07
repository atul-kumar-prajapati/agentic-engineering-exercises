# Exercise 03: Promptfoo Review Regression Lab

## Objective

Measure whether a review prompt catches real historical defects without creating false blockers on harmless look-alike changes.

## Starting Point

The harness includes a valid historical bad diff, a multi-bug case, a clean control, baseline and candidate prompts, a structural sanity check, model-graded Promptfoo configuration, and explicit adoption thresholds.

## Required Implementation Changes

- Run the same cases against the baseline and candidate prompt with the model used for real review.
- Use at least three samples per case.
- Report historical recall, multi-bug recall, clean-control precision, and regression against baseline.
- Improve the prompt without naming case-specific defects or keywords.
- Apply the adoption thresholds and record limitations and decision.

## Allowed Changes

Change prompts, eval cases, scoring/report logic, and evidence. Do not encode expected findings, case IDs, exact diff tokens, or assertion answers into the provider or candidate prompt.

## Required Commands

Use the supported versions and clean-install sequence in [the submission standard](../../docs/SUBMISSION_STANDARD.md).

From `regression-review-app`:

```text
npm ci
npm run eval:smoke
set REVIEW_EVAL_MODEL=<provider:model>
npm run eval:model
npm run agent:check
```

Use shell-appropriate environment syntax and repeat the model run to reach the declared sample count.

## Acceptance Criteria

- The real review model and full diffs are evaluated.
- Multi-bug and clean controls affect adoption.
- Adding checklist words alone cannot guarantee success.
- Recall and precision meet `docs/adoption-thresholds.md`.
- Model, configuration, sample count, scores, and limitations are recorded.

## Evidence Contract

Commit raw Promptfoo outputs plus a completed `docs/report-template.md` under `evidence/review-eval.md`. Include baseline/candidate prompt SHAs and adoption decision.

## Incomplete When

Only deterministic keyword checks run, provider logic contains answers, clean controls are absent, model/configuration/sample count is missing, or the candidate improves recall by increasing false blockers.

## Evaluation Rubric

See [Review Regression Lab](../../docs/EVALUATION_RUBRICS.md#review-regression-lab).

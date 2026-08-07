# Exercise 02: Fresh-Agent Diff Triage

## Objective

Use an independent review pass on an exact implementation range, fix supported blockers, and reject seeded reviewer noise with evidence.

## Starting Point

`fixtures/review-target.bundle` contains the exact base and head SHAs in `fixtures/manifest.json`; `pr/review-target.diff` is the equivalent applicable patch. The change adds workflow caching and contains multiple real defects. `docs/reviewer-noise.md` supplies one plausible but unsupported claim.

## Required Implementation Changes

- Review `review-base..review-head` with a fresh agent/session.
- Classify every finding as blocker, non-blocker, or unsupported.
- Check mutable sorting, cache updates after save, filter-triggered clearing, JSON parsing, and evidence side effects.
- Confirm or dismiss the seeded claim from code evidence.
- Fix merge blockers and add focused regression tests.

## Allowed Changes

Change blocker fixes, focused tests, review/evidence files, and no unrelated application areas. Do not edit the bundle, manifest, or seeded claim.

## Required Commands

Use the supported versions and clean-install sequence in [the submission standard](../../docs/SUBMISSION_STANDARD.md).

From the exercise directory and app:

```text
node scripts/verify-review-fixture.mjs
cd fresh-review-app
npm ci
npm run agent:check
```

Run focused tests added for each blocker.

## Acceptance Criteria

- The exact manifest comparison is reproducible.
- Real state, mutation, and error-handling defects are supported by scenarios.
- The unsupported claim is explicitly confirmed or dismissed.
- Blockers are fixed without unrelated refactors.
- Evidence records the independent review context and verification.

## Evidence Contract

Commit `evidence/fresh-review.md` with base/head SHA, reviewer/session, severity, file/line, scenario, decision, fix, and command result. Include focused test output.

## Incomplete When

The reviewer shares implementation context, uses a different diff, repeats seeded noise without checking, fixes unsupported findings, or leaves a supported blocker untested.

## Evaluation Rubric

See [Fresh-Agent Diff Triage](../../docs/EVALUATION_RUBRICS.md#fresh-agent-diff-triage).

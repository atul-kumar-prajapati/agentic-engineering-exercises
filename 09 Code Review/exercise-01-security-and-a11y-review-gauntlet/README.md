# Exercise 01 : Security and Accessibility Review Gauntlet

## Your Mission

Your mission is to review an exact vulnerable PR, separate scanner signal from noise, and find important behavior defects that static analysis misses.

You are given a dynamic HTML sink, a trusted static look-alike, lost keyboard semantics, weak note validation, and a server transition bypass. Treating every scanner warning as a blocker will produce the wrong review.

Review the supplied base-to-head range, prove every finding, fix confirmed blockers at the correct boundary, and add regression tests.

The duration for this challenge is 30 min or less.

## Project

[review-gauntlet-app](./review-gauntlet-app) contains the target application. `fixtures/review-target.bundle` and `fixtures/manifest.json` define the protected comparison.

## How To Go About It

Verify and clone the bundle, then review `review-base..review-head`. Run Semgrep, reproduce its findings, and inspect keyboard and state-transition behavior manually.

Classify findings by severity and confidence. Dismiss unsupported scanner output with evidence, then fix confirmed blockers and add UI or server-boundary tests.

## Evidence

Submit the fixes and tests, `evidence/review.md`, Semgrep output, fixture verification output, and final check output. Each finding needs file and line, scenario, impact, source, decision, and test.

Run `node scripts/verify-review-fixture.mjs`, `semgrep scan --config semgrep.yml`, `npm run test:policy`, `npm run test:submission`, and `npm run agent:check` as described by the project paths.

Raise a focused PR containing only this exercise. Follow the [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

Reviewers will check the exact comparison, true-versus-false positive decisions, keyboard behavior, dynamic note rendering, note validation, and server policy enforcement.

The exercise is incomplete if scanner output is copied blindly, the manual defects are missed, a finding lacks reproduction evidence, or a blocker has no regression test.

See the [Security and Accessibility Review Gauntlet rubric](../../docs/EVALUATION_RUBRICS.md#security-and-accessibility-review-gauntlet).

# Exercise 01: Semgrep Security and Accessibility Review Gauntlet

## Objective

Review an actual vulnerable comparison, distinguish scanner signal from noise, find the manual behavior defects, fix confirmed blockers at the correct boundary, and verify them.

## Starting Point

`fixtures/review-target.bundle` contains exact `review-base` and `review-head` refs recorded in `fixtures/manifest.json`. The equivalent patch is valid against the supplied app. Semgrep flags one exploitable dynamic HTML sink and one trusted static announcement that requires reviewer judgment. The target also removes keyboard semantics and weakens server transition policy.

## Required Implementation Changes

- Clone the bundle or apply the patch and review the exact comparison.
- Run `semgrep scan --config semgrep.yml`.
- Rank findings, prove true positives, and explicitly dismiss unsupported output.
- Find manual accessibility and state-transition defects.
- Fix confirmed blockers and add regression tests, including the server policy boundary.

## Allowed Changes

Change confirmed vulnerable code, focused tests, Semgrep configuration only when justified, and evidence. Do not delete the trusted static control merely to reduce scanner output or edit the fixture bundle/manifest.

## Required Commands

Use the supported versions and clean-install sequence in [the submission standard](../../docs/SUBMISSION_STANDARD.md).

From `review-gauntlet-app`:

```text
npm ci
npm run test:policy
npm run agent:check
semgrep scan --config semgrep.yml
```

From the exercise directory, run `node scripts/verify-review-fixture.mjs` and confirm the patch applies to the base.

## Acceptance Criteria

- Exact base/head SHAs match the manifest.
- Scanner true and false positives are separated with evidence.
- Dynamic note rendering, keyboard regression, note validation, and server transition bypass are reviewed.
- Confirmed fixes have tests at UI or server boundary as appropriate.
- All required commands pass after fixes.

## Evidence Contract

Commit `evidence/review.md` with severity, file/line, reproduction, scanner/manual source, fix/dismiss decision, and test. Include Semgrep and test output.

## Incomplete When

The real comparison is not used, every scanner warning is accepted blindly, keyboard or server policy is missed, a finding lacks evidence, or a confirmed issue has no regression test.

## Evaluation Rubric

See [Security and Accessibility Review Gauntlet](../../docs/EVALUATION_RUBRICS.md#security-and-accessibility-review-gauntlet).

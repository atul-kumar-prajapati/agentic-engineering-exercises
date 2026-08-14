# Exercise 02 : Specialist Review Merge Gate

## Your Mission

Your team is about to merge an access-approval change with interacting security, accessibility, performance, and testability risks. Your mission is to use independent specialist agents to find, triage, fix, and recheck those risks against exact Git commits.

The application renders unsafe notes, uses mouse-only review rows, repeats expensive calculations, and trusts UI authorization. A single general review can miss both individual defects and their combined impact.

Run a controlled before-and-after specialist review cycle and make the merge decision from reproducible evidence.

The duration for this challenge is 45 min or less.

## Project

[nfr-swarm-app](./nfr-swarm-app) contains the access-review workflow and protected specialist checks. The [risk seeds](./docs/nfr-risk-seeds.md), [specialist prompts](./docs/specialist-prompts.md), and [remediation contract](./docs/remediation-contract.md) define the review scope.

## How To Go About It

1. Record one clean baseline SHA in `evidence/before.md` and create `evidence/before.patch` for the risky change under review.

2. Start four separate review-only sessions for security, accessibility, performance, and testability. Give each specialist only its role prompt, the baseline SHA, report format, and focused command. Specialists must not edit code.

3. Verify that every finding has a source location, reproducible evidence, impact, and recommendation. Combine duplicates and record a fix, defer, or dismiss decision for every unique finding.

4. As integration owner, implement all supported blockers in one remediation commit. Do not include evidence files in that commit. Measure performance at the baseline and remediation SHAs with identical inputs.

5. Start four fresh specialist sessions for the final recheck. Every recheck must inspect the same remediation SHA and run its focused command.

6. Save the remediation state in `evidence/after.md` and `evidence/after.patch`. Link every original finding to its decision, code change, recheck result, and remaining risk.

7. Run the complete gate and raise the PR only when all required blockers are resolved and the evidence matches the reviewed Git history.

## Evidence

Submit:

- `evidence/before.md`, `evidence/before.patch`, `evidence/after.md`, and `evidence/after.patch`.
- `evidence/review-cycle.json` and `evidence/decision-log.json`.
- Eight specialist reports and eight command outputs, one before and one after per specialist.
- Performance results for both SHAs and `evidence/integration.md`.
- `evidence/comparison.md` with findings, decisions, rechecks, performance, and merge outcome.
- Output from `npm run verify:exercise`.
- A focused pull request containing only this exercise.

Run `npm run verify:exercise` before raising the PR. It checks protected inputs, application quality, all specialist gates, review provenance, triage, remediation, rechecks, performance, and required evidence.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- Four distinct baseline sessions review one baseline SHA without editing application code.
- Every finding has evidence and a recorded decision, and all required blockers are fixed in one remediation commit.
- Four fresh sessions recheck one remediation SHA with matching passing command evidence.
- Performance is measured at both SHAs with identical inputs and meets the required improvement.
- `npm run verify:exercise` passes and the merge decision is fully traceable to the submitted proof.

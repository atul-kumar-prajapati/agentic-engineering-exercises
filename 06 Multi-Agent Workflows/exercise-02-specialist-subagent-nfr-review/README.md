# Exercise 02 : Specialist Review Merge Gate

## Your Mission

Your mission is to use specialist agents to review one risky access-approval change and make a single accountable merge decision.

You are given unsafe HTML rendering, mouse-only queue rows, expensive render work, and an approval service that trusts the UI. Specialist reports can also conflict or describe different commits.

Run security, accessibility, performance, and testability reviews against the same SHA, triage every finding, fix supported blockers, and make the specialists recheck the final SHA.

The duration for this challenge is 30 min or less.

## Project

[nfr-swarm-app](./nfr-swarm-app) contains the access-review workflow and seeded risks. Use the supplied [specialist prompts](./docs/specialist-prompts.md) and shared report schema.

## How To Go About It

Give each specialist the same commit, scope, severity rules, and evidence format. Findings must include a file and line, reproduction, impact, and proposed verification.

The integration owner classifies each finding as fix, defer, or dismiss with an owner and residual risk. After fixes, rerun every affected specialist instead of relying on the original report.

## Evidence

Submit four reports under `evidence/specialists/`, `evidence/decision-log.md`, before-and-after performance JSON, keyboard or assistive-technology evidence, and the final SHA and check output.

Run `npm run measure:baseline`, `npm run test:submission`, and `npm run agent:check` from `nfr-swarm-app`.

Raise a focused PR containing only this exercise. Follow the [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

Reviewers will check that specialists reviewed the same code, evidence supports each finding, privileged approval is enforced at the service boundary, keyboard operation works, and performance claims use comparable measurements.

The exercise is incomplete if reports are blindly merged, findings lack evidence, different SHAs are compared without explanation, or the final code is not re-reviewed.

See the [Specialist Review Merge Gate rubric](../../docs/EVALUATION_RUBRICS.md#specialist-review-merge-gate).

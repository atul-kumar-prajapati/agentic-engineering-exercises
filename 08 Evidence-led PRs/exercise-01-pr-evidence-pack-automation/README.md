# Exercise 01 : Failure-Preserving PR Evidence Pack

## Your Mission

Your mission is to build a GitHub Actions evidence pack that remains trustworthy when a PR check fails.

You are given test, screenshot, and risk inputs. The current process publishes only successful output, uses unstable artifact paths, and lets reviewers infer rollback risk.

Create one deterministic evidence bundle tied to the commit SHA, upload it even when a check fails, and make missing or inconsistent evidence fail the workflow.

The duration for this challenge is 30 min or less.

## Project

[pr-evidence-app](./pr-evidence-app) contains the application. Protected inputs under `fixtures/` include passing and failing checks that the evidence generator must preserve.

## How To Go About It

Add a least-privilege GitHub Actions workflow and a local evidence generator. The bundle must contain commit SHA, command, exit code, result, artifact path and digest, risk, reviewer action, and rollback for every required check.

Use stable paths and upload the bundle with an `always()` condition. Do not convert a failed check to success merely to publish evidence.

## Evidence

Submit `.github/workflows/pr-evidence.yml`, the generator, `evidence/pr-evidence.json`, `evidence/README.md`, and one local reproduction showing the failed smoke result remains visible.

Run `npm run evidence:verify`, `npm run test:submission`, and `npm run agent:check` from `pr-evidence-app`.

Raise a focused PR containing only this exercise. Follow the [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

Reviewers will check provenance, stable paths, failure preservation, artifact digest, least-privilege permissions, risk, rollback, and workflow failure propagation.

The exercise is incomplete if evidence is success-only, tied to no SHA, manually rewritten, uploaded from an unstable path, or the workflow hides a failed command.

See the [Failure-Preserving PR Evidence Pack rubric](../../docs/EVALUATION_RUBRICS.md#failure-preserving-pr-evidence-pack).

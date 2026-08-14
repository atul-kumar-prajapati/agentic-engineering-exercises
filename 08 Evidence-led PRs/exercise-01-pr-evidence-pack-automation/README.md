# Exercise 01 : Failure-Preserving PR Evidence Pack

## Your Mission

Your team is merging PRs that look green because failed checks and their artifacts are omitted from the review summary. Your mission is to automate a PR evidence pack that remains complete and honest when a required check fails.

The protected fixture contains passing tests, a failed checkout smoke check, and a UI artifact. The repository has no generator or active workflow, so a success-only report is easy to produce.

Compare an unstructured evidence attempt with an automated, failure-preserving result and prove the original exit status is never hidden.

The duration for this challenge is 45 min or less.

## Project

[pr-evidence-app](./pr-evidence-app) contains the application and verification harness. Protected [fixtures](./fixtures/check-results.json) define the checks and artifacts, and the [evidence contract](./docs/evidence-contract.md) defines the required output.

## How To Go About It

1. Create two branches from the same starting commit. In the first branch, ask a fresh coding agent to produce a PR evidence pack from the fixture without extra guidance. Do not correct or retry it. Save `evidence/before.md` and `evidence/before.patch`.

2. Review which commands, failures, artifacts, digests, risks, or rollback details were lost or rewritten.

3. In the second branch, create `pr-evidence-app/scripts/generate-pr-evidence.mjs` with the required CLI. It must copy every fixture artifact to a stable directory, calculate SHA-256 digests, write the evidence JSON and summary, and exit with the fixture's original overall result.

4. Create `.github/workflows/evidence-led-pr-01.yml` at the repository root. Use pull-request path filtering, read-only permissions, immutable action SHAs, `npm ci`, and `github.sha`.

5. Verification and upload steps must use `if: always()` without `continue-on-error`. The stable evidence directory must upload even when generation returns non-zero, while the job remains failed.

6. Start a fresh agent session in the second branch under the same agent, model, tools, permissions, prompt, time limit, and first-attempt conditions. Keep its implementation without correction or retry.

7. Commit the generator and workflow, generate evidence from that source SHA, save `evidence/after.md`, `evidence/after.patch`, and `evidence/comparison.md`, then raise the final PR from the second branch.

## Evidence

Submit:

- The evidence generator and `.github/workflows/evidence-led-pr-01.yml`.
- `evidence/before.md`, `evidence/before.patch`, `evidence/after.md`, and `evidence/after.patch`.
- Generated evidence JSON, summary, and copied artifacts under `evidence/generated/`.
- `evidence/README.md`, command output, and `evidence/comparison.md`.
- Output from `npm run verify:exercise`.
- A focused pull request containing only this exercise and its workflow.

Run `npm run verify:exercise` before raising the PR. It checks protected inputs, application quality, failing and passing fixtures, generated evidence integrity, workflow safety, source SHA, and required before-and-after proof.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- Both agent attempts use matching conditions and genuine first-attempt patches.
- Generated evidence preserves every command, result, exit code, artifact digest, risk, reviewer action, and rollback.
- The generator passes the protected failing and all-passing cases and returns the original overall status.
- The workflow is read-only, uses immutable actions, uploads evidence after failure, and does not turn the failed job green.
- `npm run verify:exercise` passes and all submitted evidence matches one source SHA and unchanged fixtures.

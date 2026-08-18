# Evidence README — Exercise 08.1 Failure-Preserving PR Evidence Pack

## Source of truth

- Source SHA: `70def5638a1604d0d1e8708bc7f5016674144403` (generator `c88bf8d` + workflow `70def56`; all later commits touch only `evidence/`)
- Fixture: `fixtures/check-results.json` (protected, SHA-256 `8bc9ab32efd8f3326ac1dcb0d0d7a0a8617dca1fde6326300b90a79be1f98110`)
- Generated pack: `evidence/generated/pr-evidence.json` and `evidence/generated/summary.md`, produced by `npm run evidence:generate -- --sha 70def5638a1604d0d1e8708bc7f5016674144403` (exit code 1, preserved).

## Overall result

**failed — overall exit code 1.** The `checkout-smoke` check (`npm run test:smoke`) failed: payment authorization could not be completed. This PR must not merge until that failure is explained and corrected. The failing artifact is `evidence/generated/artifacts/checkout-smoke.txt`; the corroborating UI artifact is `evidence/generated/artifacts/checkout.svg`.

## What a reviewer should do

Read `evidence/generated/summary.md` for every check's result, exit code, artifact path, artifact SHA-256, Risk, Reviewer action, and Rollback. In short:

- `unit-tests` passed (exit code 0) — confirm the digest; rollback by reverting the PR commit on later regression.
- `checkout-smoke` failed (exit code 1) — Risk: high. Reviewer action: block merge. Rollback: do not deploy; revert the checkout change if deployed.
- `ui-screenshot` passed (exit code 0) — rendering proves nothing about checkout success; compare against the expected state.

## Reproduce

From `pr-evidence-app/`:

```bash
npm ci
npm run evidence:generate -- --sha 70def5638a1604d0d1e8708bc7f5016674144403   # exits 1
npm run evidence:verify                                                     # verifies pack, git binding, workflow
```

The generator's exit code equals the fixture's overall exit code; verification output is captured in `evidence/commands/evidence-verify.txt`. The CI counterpart is `.github/workflows/evidence-led-pr-01.yml`, which uploads `evidence/generated` even when generation fails while keeping the job red.

## Attempt evidence

- `evidence/before.md` + `evidence/before.patch` — unstructured first attempt (branch `codex/exercise-08-01-pr-evidence-pack-automation-before`).
- `evidence/after.md` + `evidence/after.patch` — automated first attempt.
- `evidence/comparison.md` — matched-conditions comparison.

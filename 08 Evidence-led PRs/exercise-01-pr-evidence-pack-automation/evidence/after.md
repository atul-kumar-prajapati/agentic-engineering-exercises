# After: Automated, Failure-Preserving Evidence Attempt

## Session conditions

- Starting commit: `3761a42840cbbc4ee9143ecc914519b4f8c6cc0c`
- Implementation commit: `70def5638a1604d0d1e8708bc7f5016674144403` (branch `codex/exercise-08-01-pr-evidence-pack-automation`; generator committed as `c88bf8d`, workflow as `70def56`)
- Agent and model: opencode subagent session, model `opencode-go/glm-5.3` — same as the before attempt.
- Tools and permissions: file read/write plus bash; local repository only; no network, no global installs.
- Time limit: single sitting under the exercise's 45-minute target.
- Human hints: 0
- Retries: 0
- Patch: `evidence/after.patch`
- Inputs provided: the same plain mission plus the repository's own contracts — `docs/evidence-contract.md`, `docs/evidence-fixtures.md`, `docs/pr-brief.md`, `docs/action-pins.json`, `pr-evidence-app/package.json`, and `pr-evidence-app/scripts/evidence-verification.mjs`. This is the exercise's independent variable: identical session conditions, contract-led instead of unstructured.

## What was produced

- `pr-evidence-app/scripts/generate-pr-evidence.mjs`: the pack generator with the required CLI (`--fixture`, `--sha`, `--output`).
- `.github/workflows/evidence-led-pr-01.yml` at the repository root: read-only, SHA-pinned pull-request workflow that generates, verifies, and uploads the pack with `if: always()` and no `continue-on-error`.

Both were kept from the first attempt without correction; defects the session found in its own code (argument-parsing bugs) were fixed within that same first pass.

## Proof table

| Proof | Result |
|---|---|
| Failed checks preserved | 1 of 1 (`checkout-smoke`, exit 1) — pack records `overallResult: "failed"`, `overallExitCode: 1` |
| Commands with exit codes | 3 of 3, byte-equal to the fixture fields |
| Artifacts copied and hashed | 3 of 3 fixture artifacts, byte-identical copies with SHA-256 digests in both `pr-evidence.json` and `summary.md` |
| Risk, reviewer action, and rollback present | Yes, per check, verbatim |
| Generator exit code | 1 for the failing fixture, 0 for the all-passing fixture — set via `process.exitCode` only after the full pack is written |
| Files changed | 2 |
| Lines added and removed | `+205 / -0` |

## Verification observed in-session

- Failing fixture → exit 1 with complete pack; passing fixture → exit 0; both re-verified independently by the integration owner (see `evidence/commands/evidence-verify.txt`).
- Path-escape fixture (`outputPath: "../outside.txt"`) → exit 2, no `pr-evidence.json` written.
- Result/exit-code mismatch fixture (exit 2 marked passed) → exit 2, no pack written.
- Workflow accepted by the harness `verifyWorkflow` check with an empty failure list.

# Feature Flag Rollback Evidence

Record only the first attempt from each agent session. Use full Git SHAs, exact commands, exit codes, call counts, configuration digests, and generated artifact paths.

## `evidence/before.md` and `evidence/after.md`

- Starting commit:
- Implementation commit:
- Agent and model:
- Tools and permissions:
- Time limit:
- Human hints: 0
- Retries: 0
- Patch: `evidence/before.patch` or `evidence/after.patch`
- Patch SHA-256:

| State | Experience | Preview API calls | Telemetry events | Check exit code |
|---|---|---:|---:|---:|
| Enabled | | | | |
| Disabled | | | | |
| Provider error | | | | |
| Invalid context | | | | |
| API failure | | | | |

Also record files changed, lines added and removed, rollback exit code, before and after config digests, interruption result, concurrent command exit codes, and rollback audit path.

## `evidence/comparison.md`

Confirm matching run conditions. Compare every flag state, call count, telemetry count, targeting key, rollback behavior, verification result, and changed files. Support the conclusion with generated artifacts and both patches.

Include the exact phrases `Same conditions`, `Before`, `After`, `Proof`, and `Conclusion`. Commit each untouched attempt and generate its patch with `git diff --binary --full-index <starting-commit> <that-attempt-implementation-commit>`.

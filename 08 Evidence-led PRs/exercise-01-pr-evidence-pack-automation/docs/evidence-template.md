# PR Evidence Pack Evidence

Record only the first attempt from each agent session. Use full Git SHAs, exact commands, exit codes, artifact paths, and SHA-256 digests.

## `evidence/before.md` and `evidence/after.md`

- Starting commit:
- Implementation commit:
- Agent and model:
- Tools and permissions:
- Time limit:
- Human hints: 0
- Retries: 0
- Patch: `evidence/before.patch` or `evidence/after.patch`

| Proof | Result |
|---|---|
| Failed checks preserved | Number out of total failures |
| Commands with exit codes | Number out of total commands |
| Artifacts copied and hashed | Number out of total artifacts |
| Risk, reviewer action, and rollback present | Yes or No |
| Generator exit code | Number |
| Files changed | Number |
| Lines added and removed | `+N / -N` |

## `evidence/comparison.md`

Confirm matching run conditions. Compare omitted checks, changed results, missing artifacts, digest coverage, failure exit status, reviewer guidance, workflow behavior, and changed files. Support the conclusion with generated files and both patches.

# Context Budget Evidence

Record only the first attempt from each agent session. Use full Git SHAs, exact file paths, UTF-8 byte counts, commands, and exit codes.

## `evidence/before.md` and `evidence/after.md`

- Starting commit:
- Implementation commit:
- Agent and model:
- Tools and permissions:
- Time limit:
- Human hints: 0
- Retries: 0
- Context source:
- Patch: `evidence/before.patch` or `evidence/after.patch`

| Metric | Result |
|---|---|
| Sources loaded | Number and paths |
| Total UTF-8 bytes | Number |
| Mandatory sources missed | Number |
| Stale or irrelevant sources loaded | Number |
| Adapter checks | Pass or fail; exit code |
| Files changed | Number |
| Lines added and removed | `+N / -N` |

## `evidence/comparison.md`

Confirm matching run conditions. Compare context bytes, sources, missed rules, stale context, open questions, implementation checks, and changed files. Support the conclusion with both patches and the final ledger.

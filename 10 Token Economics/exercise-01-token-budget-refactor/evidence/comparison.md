# Comparison

## Matched conditions

Both first attempts used subagent model `cursor-grok-4.6-high`, the same request (implement `adaptSession` plus `adaptSession.test.mjs` under `token-budget-app/src/session/`, Node built-in tests, no new dependencies), the same tools and permissions, a 45-minute cap, zero human hints, and zero retries. Both started at `3761a42840cbbc4ee9143ecc914519b4f8c6cc0c` in disjoint worktrees.

The independent variable is which catalog sources were in the prompt: all six (2580 UTF-8 bytes) versus the selector's three current sources (1562 UTF-8 bytes). It is not measured adapter quality.

## Context bytes and sources

| | Before | After |
|---|---|---|
| Sources | 6 | 3 |
| UTF-8 bytes | 2580 | 1562 |
| Mandatory missed | 0 | 0 |
| Stale loaded | 1 (`legacy-migration-notes`) | 0 |
| Irrelevant loaded | 2 (`ui-style-guide`, `audit-retention`) | 0 |
| Open question (`errors`) | error contract was in the dump | error contract selected by plan |
| Adapter unit tests | 13 pass, exit 0 | 11 pass, exit 0 |
| Shared current-contract oracle | 10/10, exit 0 | 10/10, exit 0 |
| Files changed | 2 | 2 |
| Diff | `+214 / -0` | `+200 / -0` |

Ledger at `sourceSha` `bb581c4941be75cebb31d57d7247e20efc192d20`: selected 1562/1700, remaining 138, skipped stale + two irrelevant.

## Correctness was not traded for cost

The before attempt was already correct. Full context included stale v1 notes, and the agent still implemented `userId` (not `subject`), stable role order, ISO `expiresAt`, and `SessionAdapterError`. That is a too-good baseline, not a problem to fix. `repository-rules` (`docs/context-sources/AGENTS.md` in this working tree) tells the reader to treat those notes as historical background, so extra bytes did not force a wrong adapter.

The after attempt, given 1018 fewer bytes and no stale or UI/audit docs, also passed the same shared oracle. Context reduction did not reduce task correctness. What the cheaper pack cannot do is *enforce* selection on the next task: without the selector and ledger, a later session can load the 2580-byte dump again.

Patches: `evidence/before.patch` (companion `abd0f78175825deeb1c140db6d82c91689c8cbb8`) and `evidence/after.patch` (companion `803df79f4525c664d7124840ac6d55e32cce239d`). Neither adapter file is on the exercise branch.

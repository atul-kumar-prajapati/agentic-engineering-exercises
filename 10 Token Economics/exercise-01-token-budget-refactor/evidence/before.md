# Before: unbudgeted first attempt

- Starting commit: `3761a42840cbbc4ee9143ecc914519b4f8c6cc0c`
- Implementation commit: `abd0f78175825deeb1c140db6d82c91689c8cbb8` (companion branch `codex/exercise-10-01-token-budget-refactor-before`)
- Agent and model: Cursor Grok 4.6 parent; first-attempt subagent `cursor-grok-4.6-high`
- Tools and permissions: read/write/shell in `/tmp/ex-10-01-before` only; no push; no PR
- Time limit: 45 minutes
- Human hints: 0
- Retries: 0
- Context source: full catalog pack, all six sources (2580 UTF-8 bytes), pasted into the prompt
- Patch: `evidence/before.patch`

| Metric | Result |
|---|---|
| Sources loaded | 6: `docs/context-sources/AGENTS.md`, `current-adapter-contract.md`, `current-error-contract.md`, `legacy-migration-notes.md`, `ui-style-guide.md`, `audit-retention.md` |
| Total UTF-8 bytes | 2580 |
| Mandatory sources missed | 0 |
| Stale or irrelevant sources loaded | 3 (`legacy-migration-notes` stale; `ui-style-guide` and `audit-retention` irrelevant) |
| Adapter checks | Pass; `node --test src/session/adaptSession.test.mjs` exit 0 (13/13). Shared oracle vs current contracts: 10/10, exit 0 |
| Files changed | 2 |
| Lines added and removed | `+214 / -0` (74 + 140) |

The unbudgeted session still rejected v1 rules (`subject`, sorted roles, epoch expiry, `LegacySessionError`) because `repository-rules` names those notes as historical background. That is recorded, not corrected. Adapter code is not on the exercise branch; only this patch is.

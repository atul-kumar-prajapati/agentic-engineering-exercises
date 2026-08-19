# After: budgeted first attempt

- Starting commit: `3761a42840cbbc4ee9143ecc914519b4f8c6cc0c`
- Implementation commit: `803df79f4525c664d7124840ac6d55e32cce239d` (companion branch `codex/exercise-10-01-token-budget-refactor-after`)
- Agent and model: Cursor Grok 4.6 parent; first-attempt subagent `cursor-grok-4.6-high`
- Tools and permissions: read/write/shell in `/tmp/ex-10-01-after` only; no push; no PR
- Time limit: 45 minutes
- Human hints: 0
- Retries: 0
- Context source: selected catalog pack only (1562 UTF-8 bytes): `repository-rules`, `current-adapter-contract`, `current-error-contract`
- Patch: `evidence/after.patch`

| Metric | Result |
|---|---|
| Sources loaded | 3: `docs/context-sources/AGENTS.md`, `current-adapter-contract.md`, `current-error-contract.md` |
| Total UTF-8 bytes | 1562 |
| Mandatory sources missed | 0 |
| Stale or irrelevant sources loaded | 0 |
| Adapter checks | Pass; `node --test src/session/adaptSession.test.mjs` exit 0 (11/11). Shared oracle vs current contracts: 10/10, exit 0 |
| Files changed | 2 |
| Lines added and removed | `+200 / -0` (62 + 138) |

`after.patch` is the unaided companion-branch attempt. Integration did not edit those blobs. A follow-up `tsc` in that worktree exited 127 (`tsc: command not found`) because `npm ci` was not run there; adapter tests do not need it. Design was not changed after that.

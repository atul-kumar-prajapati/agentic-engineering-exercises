# Verification

App directory: `10 Token Economics/exercise-01-token-budget-refactor/token-budget-app`. Each script was run individually. `verify:exercise` after the evidence commit is also in `evidence/guardrails.md`.

Citation tree for selector and catalog: this working tree. History tree: Git objects at `planSha` `8d94b4c9daa55fecba34f36c9b643aec78ec803a` and `sourceSha` `bb581c4941be75cebb31d57d7247e20efc192d20`.

| Script | Exit |
|---|---|
| `npm run test:integrity` | 0 |
| `npm run lint` | 0 |
| `npm run test` | 0 |
| `npm run format` | 0 |
| `npm run typecheck` | 0 |
| `npm run build` | 0 |
| `npm run agent:check` | 0 |
| `npm run test:context` | 0 |
| `npm run context:verify` | 0 |
| `npm run test:submission` | 0 |
| `npm run verify:implementation` | 0 |
| `npm run verify:submission` | 0 |

Adapter first attempts (companion worktrees, same starting SHA `3761a42840cbbc4ee9143ecc914519b4f8c6cc0c`):

| Check | Before | After |
|---|---|---|
| `node --test src/session/adaptSession.test.mjs` | exit 0, 13 pass | exit 0, 11 pass |
| Shared current-contract oracle (`/tmp/ex-10-01-adapter-oracle.mjs`) | 10/10, exit 0 | 10/10, exit 0 |

Captured: `evidence/commands/context-tests.txt` (exit 0), `evidence/commands/context-verify.txt` (Plan SHA / Source SHA / Selected bytes 1562/1700 / evidence-only follow-up).

Tool on broken state: starter `selectContext` returns all six sources (2580 bytes) and ignores `maximumBytes` (`src/budget/selectContext.mjs` at base `3761a42`). Protected `run-context-tests.mjs` fails on that selector (seeded). Tool on fixed state: `npm run test:context` exit 0 at `sourceSha`.

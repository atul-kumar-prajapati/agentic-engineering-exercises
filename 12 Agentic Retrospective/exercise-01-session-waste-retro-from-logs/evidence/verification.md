# Verification

All commands run from `session-waste-app` unless noted. Source commit `9904a0a9a23333b8da2d4417a1febe79daf53359`. Parent: Cursor Grok 4.6. Subagents: cursor-grok-4.6-high.

## Individual gates

| Script | Exit |
|---|---|
| `npm run test:integrity` | 0 (Verified 17 protected challenge inputs) |
| `npm run lint` | 0 |
| `npm run test` | 0 |
| `npm run format` | 0 |
| `npm run typecheck` | 0 |
| `npm run build` | 0 (vite build in temp dir) |
| `npm run test:analysis` | 0 |
| `npm run retro:verify` | 0 (`PASS preventable calls 4 -> 1`) |
| `npm run test:submission` | 0 (10 files; after `evidence/commands/retro-verify.txt` existed) |
| `npm run verify:implementation` | 0 |
| `npm run verify:submission` | 0 |
| `npm run agent:check` | 0 |
| `npm run verify:exercise` | 0 (pre-evidence-commit; re-run after the evidence commit) |

Captured `npm run retro:verify` output is `evidence/commands/retro-verify.txt` (includes `Source SHA`, `preventable calls`, `PASS`, `exit code: 0`).

## Tool on the broken state

Seeded `analyzeSession.mjs` at `52090ed` on `docs/session-events.json`:

```
duplicateReads 4, unchangedFailureRetries 3, oversizedContextLoads 0, preventableCalls 7, finalVerificationRuns 0, correctnessPassed false
```

`preflightPolicy.mjs` is absent at `52090ed`. `run-analysis-tests.mjs:9` throws `Create src/retro/preflightPolicy.mjs and export evaluateCommandAttempt`.

## Tool on the fixed state

`analyzeSession` at `9904a0a` on the same protected trace: duplicateReads 1, unchangedFailureRetries 2, oversizedContextLoads 1, preventableCalls 4, finalVerificationRuns 0, correctnessPassed false (`evidence/baseline.json`, matches `run-analysis-tests.mjs:13-21`).

`analyzeSession` on `evidence/replay-events.json`: preventableCalls 1, unchangedFailureRetries 0, finalVerificationRuns 1, correctnessPassed true (`evidence/after.json`).

`npm run test:analysis` exit 0. `npm run retro:verify` exit 0.

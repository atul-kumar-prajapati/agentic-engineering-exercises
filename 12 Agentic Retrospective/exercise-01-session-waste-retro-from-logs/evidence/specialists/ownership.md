# Specialist ownership

| Lane | Scope | Out of bounds | Verification command | Output | Write permission |
|---|---|---|---|---|---|
| Metrics / classification | `analyzeSession.mjs` vs `docs/metric-contract.md` and `docs/session-events.json`: duplicateReads, unchangedFailureRetries, oversizedContextLoads, preventableCalls, finalVerificationRuns, correctnessPassed, sequence/schema rejection | Preflight `evaluateCommandAttempt`; replay Git binding and evidence Markdown | `npm run test:analysis` | Verdict, per-item table, file:line for every defect and dismissal | Read-only |
| Preflight / retry policy | `evaluateCommandAttempt` in `preflightPolicy.mjs` vs `docs/preflight-contract.md` and `scripts/run-analysis-tests.mjs` protected cases | Analyzer metric counts; replay events and `sourceSha` history | `node ./scripts/run-analysis-tests.mjs` | Verdict, case table, file:line | Read-only |
| Replay / evidence integrity | `replay-events.json` vs `docs/replay-contract.md`; metadata vs `session-metadata.json`; `baseline.json`/`after.json` vs live analyzer; `sourceSha` `diff-tree` and later-commit evidence-only rule | Analyzer internals; preflight decision logic | `git diff-tree` / `merge-base --is-ancestor` / live `analyzeSession` | Verdict, per-item table, file:line | Read-only |

Integration owner only writes files. Parent: Cursor Grok 4.6. First-attempt and specialist subagents: `cursor-grok-4.6-high`. Lanes ran in parallel after `sourceSha` `9904a0a9a23333b8da2d4417a1febe79daf53359`.

Citation tree (no bundle): learner `file:line` is the source-commit / working-tree blobs under `/tmp/ex-12-01`. Protected lines are checked-in `docs/session-events.json`, `docs/metric-contract.md`, `docs/preflight-contract.md`, `docs/replay-contract.md`, `scripts/run-analysis-tests.mjs`, `scripts/retro-verification.mjs`, `scripts/verify-retro-submission.mjs` (identical to `upstream/main`). Replay JSON line numbers are the working-tree file later committed as evidence.

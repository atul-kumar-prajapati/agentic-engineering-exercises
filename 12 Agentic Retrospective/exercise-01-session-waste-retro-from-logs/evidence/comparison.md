# Comparison

## Same conditions

Both first-attempt implementations used starting commit `52090edddf032d026ece16ef90feb627bf8e67ac`, agent/model `cursor / cursor-grok-4.6-high`, Cursor worktrees, npm in `session-waste-app`, 45-minute limit, human hints 0, retries 0. Patches are `git diff --binary --full-index <starting-commit> <implementation-commit>`.

The after run received the repo contracts only. It did not receive the previous implementation, before.patch, or any explanation of the first attempt.

The POLICY-217 replay session used the same agent, model, promptHash, and timeLimitMinutes as `docs/session-metadata.json`, with a new sessionId. It did not receive `docs/session-events.json`, the previous `replay-events.json`, or `after.json`.

## Before

Unconstrained implementation `fdee18deb71a347f1da7df8d478a9ae5d3a3efb6`. `evidence/before.patch` SHA-256 `4bdf87791731595bb58ff46f5d6eff1e110d37360c5fe0912c9056de3f6e6f87`. `npm run test:analysis` exit 0.

This baseline already classifies the protected trace as duplicateReads 1, unchangedFailureRetries 2, oversizedContextLoads 1, preventableCalls 4, finalVerificationRuns 0, correctnessPassed false. Do not degrade it.

Independent-variable holes that still exist: a later **pass** without diagnosis clears the failure key, so fail → pass → fail is not an unchanged failure retry; a trace with no write cannot get correctnessPassed even with a passed final verification.

## After

Contract-backed implementation `9904a0a9a23333b8da2d4417a1febe79daf53359` (also `sourceSha`). `evidence/after.patch` SHA-256 `4d865674757b7756148af068cfd1770aac54281e3a1c57a19f1b9a6114fa9d1c`. `npm run test:analysis` exit 0. `after.patch` is the unaided after diff; integration fast-forwarded that commit.

The independent variable is the metric/preflight/replay contracts as extra input plus Git-bound `sourceSha`, not measured classification quality on the protected tests. Both attempts exit 0 on `test:analysis`.

Observable difference: after keys retries as `target::workspaceRevision` (`analyzeSession.mjs:33-35`) and clears that set only on diagnosis (`analyzeSession.mjs:48-50`). A pass does not reset retry state.

## Session metrics (protected baseline vs fresh replay)

Analyzer output, not hand-edited scores. Citation tree: checked-in `docs/session-events.json` (identical to `upstream/main`); working-tree `evidence/replay-events.json` produced by a new session, not a splice of the baseline.

| Category | Before (baseline seq 1–13) | After (replay seq 1–10) | Citation |
|---|---|---|---|
| duplicateReads | 1 | 0 | `session-events.json:3`; replay has four first reads (`replay-events.json:10-41`) |
| unchangedFailureRetries | 2 | 0 | `session-events.json:7-8`; replay fail seq 6 then diagnosis seq 7 (`replay-events.json:42-56`) |
| oversizedContextLoads | 1 | 1 | `session-events.json:4` (12400); `replay-events.json:6` (14240) |
| preventableCalls | 4 | 1 | sum of the three categories; delta 3 |
| finalVerificationRuns | 0 | 1 | baseline claim seq 13 (`session-events.json:14`); replay seq 10 after write seq 8 (`replay-events.json:73-80`) |
| correctnessPassed | false | true | `metric-contract.md:8` |

Remaining waste is the oversized context load. Duplicate reads were not the chosen improvement; this replay simply did not re-read the same target+version.

## Proof

Patches: `evidence/before.patch` and `evidence/after.patch`. Raw events: `docs/session-events.json` SHA-256 `1a9196d0bd6e3821f4cb712617f9aac1aac8cce2582474db70a3bf143b6386b7`, `evidence/replay-events.json` SHA-256 `9a1f6d4bde4d8aec260ce5ce10a705d0591a3285e9456baf4c651c0754b1c787`. Metrics files deep-equal live `analyzeSession` on those traces.

Starting tree without `preflightPolicy.mjs`: `npm run test:analysis` throws at `run-analysis-tests.mjs:9`. Fixed tree: exit 0.

Payload overlap vs the protected baseline is 2 events (read `src/policy.ts` v1, write `src/policy.ts` v2) — same task files, not a sequence-renumbered copy. An earlier splice that deleted seq 6–7 and swapped the claim for a final-verification was rejected and replaced.

## Conclusion

Adopt the after implementation as `sourceSha`. Ship it because retry state follows the metric contract (diagnosis or revision, not a silent pass) and because only a Git-bound three-file source commit plus a fresh replay can be verified. Keep the before baseline honest. The replay proves zero unchanged failure retries, preventable calls 4 → 1, and passed final verification after the last write.

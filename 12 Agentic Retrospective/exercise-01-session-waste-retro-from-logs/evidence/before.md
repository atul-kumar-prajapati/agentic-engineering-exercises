# Before run — unconstrained analyzer and preflight

- Starting commit: `52090edddf032d026ece16ef90feb627bf8e67ac`
- Implementation commit: `fdee18deb71a347f1da7df8d478a9ae5d3a3efb6`
- Agent and model: cursor / cursor-grok-4.6-high
- Tools and permissions: Cursor agent, isolated git worktree `/tmp/ex-12-01-before`, npm inside `session-waste-app`, no extra secrets, first attempt
- Time limit: 45 minutes
- Human hints: 0
- Retries: 0
- Patch path: `evidence/before.patch`
- Patch SHA-256: `4bdf87791731595bb58ff46f5d6eff1e110d37360c5fe0912c9056de3f6e6f87`
- Raw event file: `docs/session-events.json`
- Raw event SHA-256: `1a9196d0bd6e3821f4cb712617f9aac1aac8cce2582474db70a3bf143b6386b7`
- Analysis check: `npm run test:analysis` exit 0 on the before implementation

The prompt withheld the metric, preflight, and replay contracts as extra input. The agent still produced a three-file analyzer, preflight, and participant tests, and `test:analysis` exited 0. That is a too-good baseline, not a problem to fix.

## Seeded analyzer on the protected trace (starting commit, unfixed)

At `52090ed` the supplied `analyzeSession.mjs` counts every read and every failed command. On `docs/session-events.json` that is 4 reads counted as duplicateReads, 3 failed commands counted as unchangedFailureRetries, oversizedContextLoads 0, preventableCalls 7, finalVerificationRuns 0, correctnessPassed false.

## Corrected before implementation on the same protected trace

- Duplicate reads: 1 (`session-events.json:3`, seq 2, same `src/policy.ts` / `v1` as seq 1)
- Unchanged failed-command retries: 2 (`session-events.json:7-8`, seq 6–7)
- Oversized context loads: 1 (`session-events.json:4`, 12400 bytes)
- Total preventable calls: 4
- Final verification position and result: none. Last write is seq 10 (`session-events.json:11`). Seq 13 is `claim` / `task complete` (`session-events.json:14`), not a passed `final-verification` command. correctnessPassed false.

## Files changed / lines

3 files, 340 insertions, 7 deletions (`git diff --numstat` from the starting commit):

- `analyzeSession.mjs` 127 / 7
- `analyzeSession.test.mjs` 160 / 0
- `preflightPolicy.mjs` 53 / 0

## Observable holes vs the after implementation

The unconstrained analyzer clears a failure key when the same command later **passes** without diagnosis (`countUnchangedFailureRetries` else-delete). Fail → pass → fail at one revision is therefore not counted as an unchanged failure retry. A trace with no write is forced to `correctnessPassed: false` even if a passed `final-verification` exists.

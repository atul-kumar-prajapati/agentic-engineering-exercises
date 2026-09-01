# After run — contract-backed analyzer, preflight, and POLICY-217 replay

- Starting commit: `52090edddf032d026ece16ef90feb627bf8e67ac`
- Implementation commit: `9904a0a9a23333b8da2d4417a1febe79daf53359`
- Agent and model: cursor / cursor-grok-4.6-high
- Tools and permissions: Cursor agent, isolated git worktree `/tmp/ex-12-01-after`, npm inside `session-waste-app`, no extra secrets, first attempt
- Time limit: 45 minutes
- Human hints: 0
- Retries: 0
- Patch path: `evidence/after.patch`
- Patch SHA-256: `4d865674757b7756148af068cfd1770aac54281e3a1c57a19f1b9a6114fa9d1c`
- Analysis check: `npm run test:analysis` exit 0 on the after implementation

Implementation commit `9904a0a9a23333b8da2d4417a1febe79daf53359` is also `sourceSha`. `after.patch` is the unaided after diff (`git diff --binary --full-index` from the starting commit). Integration fast-forwarded that commit rather than rewriting blobs.

## Replay session (fresh POLICY-217)

- Raw event file: `evidence/replay-events.json`
- Raw event SHA-256: `9a1f6d4bde4d8aec260ce5ce10a705d0591a3285e9456baf4c651c0754b1c787`
- Replay metadata: `evidence/replay-metadata.json` (taskId POLICY-217, sessionId `replay-policy-217`, same agent / model / promptHash / timeLimitMinutes as `docs/session-metadata.json`)
- Duplicate reads: 0
- Unchanged failed-command retries: 0
- Oversized context loads: 1 (`replay-events.json:6`, `src/` 14240 bytes)
- Total preventable calls: 1
- Final verification position and result: seq 10 passed `npm run verify` with phase `final-verification` (`replay-events.json:73-80`) after last write seq 8 (`replay-events.json:57-64`). correctnessPassed true.

Preflight was evaluated before commands. After the seq 6 focused-test failure at workspaceRevision 1 (`replay-events.json:42-49`), `evaluateCommandAttempt` returned `DIAGNOSIS_OR_CHANGE_REQUIRED`; seq 7 is diagnosis (`replay-events.json:50-56`), not a same-revision retry.

## Files changed / lines

3 files, 243 insertions, 7 deletions (`git diff --numstat` from the starting commit):

- `analyzeSession.mjs` 99 / 7
- `analyzeSession.test.mjs` 89 / 0
- `preflightPolicy.mjs` 55 / 0

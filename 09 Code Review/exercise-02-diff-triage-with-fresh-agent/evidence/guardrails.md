# Guardrails — exercise 09.02

Run at 2026-08-19T13:11:36Z with HEAD = 7f4213225b0ba7317302bd04beb7c5ef01d8ad81 (sourceSha), before the evidence commit. Tracked tree clean throughout; only untracked evidence files were being written.

## Guardrail 1 — clean tracked tree

```
$ git status --porcelain --untracked-files=no
(empty — no tracked file modified)
```

## Guardrail 2 — protected-input restore + verify:exercise

```
$ node -e 'keys of challenge-integrity.json.protectedFiles' | while IFS= read -r p; do git checkout upstream/main -- "$p"; done   # 42 protected paths
restore exit code: 0
$ git diff HEAD --stat | wc -l
       0
(0 — every protected file is byte-identical to upstream/main; the restore changed nothing, proving no protected input was modified)
```

verify:exercise re-run immediately after the restore (all gates: integrity, lint, test, format, typecheck, build, test:cache, triage:verify, submission contract):
```
> fresh-review-app@0.1.0 test:submission
> npm run test:cache && npm run triage:verify && node ../../../scripts/verify-submission-contract.mjs ./submission-contract.json


> fresh-review-app@0.1.0 test:cache
> vitest run src/services/workflowApi.acceptance.test.ts tests/cache-regressions.test.ts && node ./scripts/run-app-cache-checks.mjs


 RUN  v3.2.7 /private/var/folders/36/50tfmfcs567flkg69pmkcww40000gn/T/opencode/ex-09-02/09 Code Review/exercise-02-diff-triage-with-fresh-agent/fresh-review-app

 ✓ src/services/workflowApi.acceptance.test.ts (4 tests) 2ms
 ✓ tests/cache-regressions.test.ts (5 tests) 2ms

 Test Files  2 passed (2)
      Tests  9 passed (9)
   Start at  18:41:39
   Duration  160ms (transform 30ms, setup 0ms, collect 42ms, tests 4ms, environment 0ms, prepare 60ms)

PASS filter changes do not clear persisted workflow data

> fresh-review-app@0.1.0 triage:verify
> node ./scripts/verify-triage-submission.mjs

Source SHA: 7f4213225b0ba7317302bd04beb7c5ef01d8ad81
PASS fresh reviewer context and exact prompt binding verified
PASS exact protected base-to-head comparison verified
PASS four cache blockers and unsupported claim triaged with evidence
PASS focused fixes and learner regression tests bound to source SHA
PASS later history contains evidence only
Verified Independent Diff Triage: 8 files and 0 directories.
```

Final exit code of `npm run verify:exercise` after the protected restore: 0

Note: an intermediate run during this capture failed only because evidence/fixture-verification.txt was initially below the 80-character floor; the file was enriched with the genuine bundle-heads output and every subsequent run passed. The protected restore itself changed no bytes.

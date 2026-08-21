# Standing guardrails

Recorded for exercise 10.3. Parent model: Cursor Grok 4.6. Worktree: `/private/tmp/ex-10-03` on `codex/exercise-10-03-minimal-diff-scope-budget`.

## 1. Verification must not mutate tracked files

Commands:

```
git status --porcelain --untracked-files=no
cd "10 Token Economics/exercise-03-minimal-diff-scope-budget/minimal-diff-app" && npm run verify:exercise
git status --porcelain --untracked-files=no
```

Tracked porcelain **before** `verify:exercise`: empty.

`npm run verify:exercise` → **exit 0**.

Tracked porcelain **after** `verify:exercise`: empty. Identical to before.

Full `git status --porcelain` before and after listed the same untracked evidence files (`after.md`, `after.patch`, `avoided-work.md`, `before.md`, `before.patch`, `commands/`, `comparison.md`, `integration.md`, `scope-budget.json`, `specialists/`, `verification.md`). Pre-existing untracked files outside this exercise in the user's main checkout were not present in this worktree and were not deleted. Ignored `node_modules/` and `dist/` are not a dirty tracked tree.

## 2. Restoring every protected path must change nothing

Protected path count re-derived from `challenge-integrity.json`: **18**. `exportButton.mjs` and `tests/export-button.test.mjs` are not in the list and were not restored.

`git diff upstream/main -- <those 18 paths>` was 0 bytes before restore (already identical). Then each path was restored with `git checkout upstream/main -- "$p"` in a `read` loop (quoted; no word-split on `10 Token Economics`):

```
10 Token Economics/exercise-03-minimal-diff-scope-budget/README.md
10 Token Economics/exercise-03-minimal-diff-scope-budget/docs/evidence-template.md
10 Token Economics/exercise-03-minimal-diff-scope-budget/docs/scope-contract.md
10 Token Economics/exercise-03-minimal-diff-scope-budget/minimal-diff-app/index.html
10 Token Economics/exercise-03-minimal-diff-scope-budget/minimal-diff-app/lab-contract.json
10 Token Economics/exercise-03-minimal-diff-scope-budget/minimal-diff-app/package-lock.json
10 Token Economics/exercise-03-minimal-diff-scope-budget/minimal-diff-app/package.json
10 Token Economics/exercise-03-minimal-diff-scope-budget/minimal-diff-app/scripts/agent-check.mjs
10 Token Economics/exercise-03-minimal-diff-scope-budget/minimal-diff-app/scripts/format-check.mjs
10 Token Economics/exercise-03-minimal-diff-scope-budget/minimal-diff-app/scripts/lint-check.mjs
10 Token Economics/exercise-03-minimal-diff-scope-budget/minimal-diff-app/scripts/run-migration-tests.mjs
10 Token Economics/exercise-03-minimal-diff-scope-budget/minimal-diff-app/scripts/scope-verification.mjs
10 Token Economics/exercise-03-minimal-diff-scope-budget/minimal-diff-app/scripts/test-scope-verifier.mjs
10 Token Economics/exercise-03-minimal-diff-scope-budget/minimal-diff-app/scripts/verify-scope-submission.mjs
10 Token Economics/exercise-03-minimal-diff-scope-budget/minimal-diff-app/src/labContract.ts
10 Token Economics/exercise-03-minimal-diff-scope-budget/minimal-diff-app/submission-contract.json
10 Token Economics/exercise-03-minimal-diff-scope-budget/minimal-diff-app/tsconfig.json
10 Token Economics/exercise-03-minimal-diff-scope-budget/minimal-diff-app/vite.config.ts
```

Restore loop **exit 0**. `git diff HEAD` **0 bytes**. `npm run verify:exercise` after restore → **exit 0**. `git diff HEAD` still **0 bytes**. Helper vs base still shows the export branch (not restored).

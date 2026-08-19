# Standing guardrails

Recorded against worktree `/tmp/ex-10-01` on `codex/exercise-10-01-token-budget-refactor` after the first evidence commit `f3f72c0ec76be9791c35cf5c3aa957425dd53b2a`. Isolation means this checkout has no leftover `??` files from sibling exercises.

## 1. Verification must not mutate tracked files

```
git status --porcelain --untracked-files=no   # before
# (empty)

cd "10 Token Economics/exercise-01-token-budget-refactor/token-budget-app"
npm run verify:exercise
# exit 0
# Verified 26 protected challenge inputs.
# Selected bytes: 1562/1700
# Verified Progressive Context Budget Refactor: 7 files and 0 directories.

git status --porcelain --untracked-files=no   # after
# (empty)
```

Full `git status --porcelain` was also empty before and after. Tracked porcelain listings were identical (both empty). Ignored `dist/` from `build` did not dirty the tree.

## 2. Restoring every protected path must change nothing

26 paths from `challenge-integrity.json`, quoted in a `while IFS= read -r p` loop (spaces in `10 Token Economics`):

```
git checkout upstream/main -- "$p"
```

`upstream/main` is `3761a42840cbbc4ee9143ecc914519b4f8c6cc0c`. Restored count: 26. `selectContext.mjs` and `tests/context-selector.test.mjs` are not in the list and were not restored.

```
git diff HEAD          # empty
npm run verify:exercise   # exit 0
git diff HEAD          # still empty
```

Protected inputs stayed byte-identical to this branch (they were never edited). `test:integrity` still reported 26 verified files.

## `verify:exercise` after this evidence commit

Exit 0, as above. Re-run after the `guardrails.md` commit is required; that exit code is appended below when that commit exists.

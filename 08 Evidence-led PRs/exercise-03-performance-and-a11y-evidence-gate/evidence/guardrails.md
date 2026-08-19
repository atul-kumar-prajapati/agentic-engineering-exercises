# Standing guardrails

Recorded because an unreported check is not evidence. Both ran in `/tmp/ex-08-03` at source SHA `44b789f75fabffb63b664a63b7e6fe7db2e2e054` with uncommitted `evidence/` (the only `??` path). Pre-existing untracked files from other checkouts are not in this worktree.

## 1. Verification must not mutate tracked files

```text
git status --porcelain --untracked-files=no   # before
cd quality-gate-app && npm run verify:exercise
git status --porcelain --untracked-files=no   # after
```

Tracked porcelain before: empty.
`npm run verify:exercise` exit=0.
Tracked porcelain after: empty. Identical to before.

Full porcelain before and after (identical):

```
?? "08 Evidence-led PRs/exercise-03-performance-and-a11y-evidence-gate/evidence/"
```

Ignored `dist/` and `node_modules/` are not a dirty tree. `verify:exercise` did not mutate tracked files.

## 2. Restoring every protected path must change nothing

Protected paths were taken from `quality-gate-app/challenge-integrity.json` (40 files) and resolved to repository-relative paths. Restore used a quoted `read` loop so spaces in `08 Evidence-led PRs` are not word-split:

```text
while IFS= read -r p; do git checkout upstream/main -- "$p"; done < protected-paths.txt
cd quality-gate-app && npm run verify:exercise
git diff HEAD
```

`git checkout` loop exit=0.
`git diff HEAD` after restore: empty.
`npm run verify:exercise` exit=0.
`git diff HEAD` after verify: empty.

`quality-gate-app/src/App.tsx`, `src/main.tsx`, `lighthouserc.json`, and `scripts/quality-gate.mjs` are not in `challenge-integrity.json` and were not restored.

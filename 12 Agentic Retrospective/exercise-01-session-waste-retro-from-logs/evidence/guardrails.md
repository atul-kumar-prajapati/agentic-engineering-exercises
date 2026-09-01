# Standing guardrails

Repository root `/tmp/ex-12-01` (worktree). Exercise app `session-waste-app`. `analyzeSession.mjs` / `preflightPolicy.mjs` / `analyzeSession.test.mjs` are not in `challenge-integrity.json` and were not restored.

## 1. Verification must not mutate tracked files

Commands:

```
git status --porcelain --untracked-files=no
cd "12 Agentic Retrospective/exercise-01-session-waste-retro-from-logs/session-waste-app" && npm run verify:exercise
git status --porcelain --untracked-files=no
```

Tracked porcelain **before**: empty.
`npm run verify:exercise` **exit 0** (`PASS verify:exercise left tracked files, the Git index, and untracked or ignored paths unchanged`).
Tracked porcelain **after**: empty. Identical to before.

Full `git status --porcelain` before and after was a single line:

```
?? "12 Agentic Retrospective/exercise-01-session-waste-retro-from-logs/evidence/"
```

Pre-existing untracked evidence (not yet committed) is unchanged. No `.DS_Store` / `.claude/` / sibling-exercise files in this worktree. Ignored `node_modules/` and temp vite `dist/` are not a dirty tree.

## 2. Restoring every protected path must change nothing

17 paths from `challenge-integrity.json`, quoted `read` loop (paths contain `12 Agentic Retrospective`):

```
while IFS= read -r p; do git checkout upstream/main -- "$p"; done < protected-paths.txt
```

`restored_count=17`. `git diff HEAD` after restore: empty. `npm run verify:exercise` **exit 0**. `git diff HEAD` after that verify: empty. Tracked porcelain still empty.

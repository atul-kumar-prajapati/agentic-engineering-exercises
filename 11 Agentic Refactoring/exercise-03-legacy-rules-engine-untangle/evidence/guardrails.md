# Standing guardrails

## 1. Verification must not mutate tracked files

Commands (from `/tmp/ex-11-03`):

```
git status --porcelain --untracked-files=no   # before — empty
cd "11 Agentic Refactoring/exercise-03-legacy-rules-engine-untangle/legacy-rules-app"
npm run verify:exercise                       # exit 0
git status --porcelain --untracked-files=no   # after — empty, identical
```

Tracked porcelain was empty before and after. Full porcelain listed only untracked `evidence/**` files that were not yet committed; those listings were identical. Pre-existing ignored `legacy-rules-api/target/` is gitignored.

**Harness note (exercise defect):** `run-clean-verification.mjs` hashes ignored files except `node_modules`. Maven Surefire XML embeds `time="…"` so a second `./mvnw test` changes `target/surefire-reports/*` and `verify:exercise` exits 1 even when `verify:exercise:core` is 0. Observed on the first wrapper run: 8 ignored surefire files reported changed; core had already printed PASS. Vite already writes `dist/` to a temp dir; Surefire does not.

Local workaround used for the passing wrapper run (not committed; `target/` is gitignored): replace `target/surefire-reports` with a symlink to `/tmp/ex-11-03-surefire` so Git sees one stable ignored symlink (`git ls-files --ignored` lists the link, not the XML). That is the same "write generated checks to a temporary directory" the wrapper asks for. A clean CI checkout without that link will recreate timed XML under `target/` and fail the wrapper. Fix belongs in `run-rules-contract.mjs` (protected) or in `run-clean-verification.mjs` ignoring `target/`.

## 2. Restoring every protected path must change nothing

19 paths from `challenge-integrity.json`, restored with a quoted `read` loop (spaces in `11 Agentic Refactoring`):

```
while IFS= read -r p; do git checkout upstream/main -- "$p"; done < protected-paths.txt
# then, in the app dir:
npm run verify:exercise      # exit 0
git diff HEAD                # empty
git status --porcelain --untracked-files=no   # empty
```

All 19 paths were byte-identical to `upstream/main` before the restore (`git diff HEAD` empty immediately after the loop). `npm run verify:exercise` after restore: exit 0. `git diff HEAD` still empty. `WorkflowService.java` and `DecisionPolicy.java` were not in the list and were not restored.

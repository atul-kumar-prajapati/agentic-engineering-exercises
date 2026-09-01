# Guardrails — Exercise 11.1

Both standing guardrails from the delivery skill, run before the evidence commit, from the isolated worktree `/tmp/ex-11-01` (branch `codex/exercise-11-01-characterization-test-refactor`, HEAD = `refactorSha` `550e1a2e4f5254375fe6360771ad260d9c4d34c2`, evidence files present but uncommitted). This worktree contains no unrelated untracked files — the only `??` entries in the full porcelain are this exercise's own in-progress evidence files, present before and after every run and unchanged by them.

## Guardrail 1 — verification must not mutate tracked files

```
git status --porcelain --untracked-files=no > before   # empty
npm run verify:exercise                                 # in rules-refactor-app
git status --porcelain --untracked-files=no > after    # empty
```

- Output capture went to a path **outside** the repository (`/tmp/verify-exercise-raw.txt`) and was copied into `evidence/commands/verify-exercise.txt` only after the run — so the capture file itself could not appear as a mutation inside `run-clean-verification.mjs`'s internal before/after snapshots.
- `npm run verify:exercise` — **exit code: 0**; final line `PASS verify:exercise left tracked files, the Git index, and untracked or ignored paths unchanged`.
- Tracked porcelain (`--untracked-files=no`): empty before, empty after — identical.
- Full porcelain: identical before and after (verified with `diff`); the only lines are the exercise's own pre-existing untracked evidence files listed above.
- Conclusion: verification mutates no tracked file, no index entry, and no untracked or ignored path.

## Guardrail 2 — restoring every protected path must change nothing

The 14 protected paths were extracted from `rules-refactor-app/challenge-integrity.json` (resolving each manifest-relative entry against the manifest directory, with the repository root taken from `git rev-parse --show-toplevel` to avoid the macOS `/tmp` → `/private/tmp` symlink trap). Each path was restored from `upstream/main` with a quoted `while IFS= read -r` loop (never word-split — the exercise paths contain spaces):

```
while IFS= read -r p; do git checkout upstream/main -- "$p"; done < /tmp/protected-paths.txt
npm run verify:exercise     # in rules-refactor-app
git diff HEAD               # must be empty
```

- Restore loop: all 14 paths restored, zero failures (3 root scripts + README + 2 docs + lab-contract.json + package.json + 4 app scripts + src/labContract.ts + submission-contract.json).
- `git diff HEAD` after the restore: **empty** — the restores were no-ops, proving no protected input was modified on this branch.
- `npm run verify:exercise` after the restore — **exit code: 0** (final line `PASS verify:exercise left tracked files, the Git index, and untracked or ignored paths unchanged`).
- Tracked porcelain before/after the whole guardrail: unchanged.
- Conclusion: every protected input on this branch is byte-identical to `upstream/main`; the submission passes with the protected tree fully restored.

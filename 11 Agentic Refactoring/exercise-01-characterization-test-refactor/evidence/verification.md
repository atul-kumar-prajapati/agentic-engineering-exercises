# Verification — Exercise 11.1

Every script the exercise's `package.json` defines (excluding the long-running dev servers), run individually from `rules-refactor-app/` on the final implementation state (HEAD = `refactorSha` `550e1a2e4f5254375fe6360771ad260d9c4d34c2`, evidence files present in the working tree). `dev` and `preview` are Vite dev/preview servers — not run, they are not gates.

## Gate loop

```
for s in test:integrity lint test format typecheck build test:oracle refactor:verify \
         test:submission agent:check verify:implementation verify:submission \
         verify:exercise:core verify:exercise; do npm run "$s" >/dev/null 2>&1; echo "$s exit=$?"; done
```

| Gate | Exit |
|---|---|
| test:integrity (14 protected challenge inputs) | 0 |
| lint | 0 |
| test (refactor-verifier self-test + agent-check) | 0 |
| format | 0 |
| typecheck | 0 |
| build (temp-dir vite build via root script) | 0 |
| test:oracle (oracle + characterization test) | 0 |
| refactor:verify | 0 |
| test:submission (oracle + refactor:verify + submission contract) | 0 |
| agent:check (integrity + lint + test + format + typecheck + build) | 0 |
| verify:implementation (test:oracle) | 0 |
| verify:submission (test:submission) | 0 |
| verify:exercise:core | 0 |
| verify:exercise (root run-clean-verification wrapper) | 0 |

## Full verify:exercise output

Captured verbatim in `evidence/commands/verify-exercise.txt` (run pre-evidence-commit, tree otherwise at `refactorSha`; exit code: 0). The final line is the shared guard's own confirmation: `PASS verify:exercise left tracked files, the Git index, and untracked or ignored paths unchanged`. A post-evidence-commit clean-tree re-run is captured in `evidence/commands/verify-exercise-final.txt`.

## Extra checks beyond the package scripts

| Check | Command | Exit |
|---|---|---|
| Shared comparable-evidence verifier (root script, not wired into this app's gates but mandated by `docs/SUBMISSION_STANDARD.md`) | `node ../../../scripts/comparable-evidence.mjs ..` | 0 — `evidence/commands/comparable-evidence.txt` |
| Oracle against the before attempt's branch | `node ./scripts/run-characterization-oracle.mjs` (before worktree) | 0 — `evidence/commands/oracle-before-branch.txt` |
| Characterization test + oracle + byte-identity on the after state | see capture | 0 — `evidence/commands/characterization-test.txt` |
| Independent parity sweep, 49,392 stable-property input variations | `node /tmp/parity/sweep.mjs` | 0 — `evidence/commands/parity-sweep.txt` |
| Stateful-accessor divergence reproducer (both refactors vs original) | `node /tmp/parity/stateful-repro.mjs` | 0 (reproducer itself exits 0; it *exhibits* the divergences it documents) — `evidence/commands/stateful-accessor-parity.txt` |
| Guardrails (porcelain + protected-path restore) | see `evidence/guardrails.md` | 0 |

## Standing guardrails

Both standing guardrails ran and are recorded with commands, output, and exit codes in `evidence/guardrails.md`: verification mutated nothing (tracked porcelain empty and identical, full porcelain identical apart from nothing — this isolated worktree contains no unrelated untracked files), and restoring all 14 protected paths from `upstream/main` changed nothing (`git diff HEAD` empty) while `verify:exercise` still exited 0.

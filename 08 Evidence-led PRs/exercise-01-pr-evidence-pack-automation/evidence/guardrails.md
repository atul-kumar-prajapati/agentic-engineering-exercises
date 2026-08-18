# Guardrails — Exercise 8.1

Two checks the submission previously performed in-session but failed to record. Both were re-run for this file on branch `codex/exercise-08-01-pr-evidence-pack-automation` at commit `fefb4dbb3a83f0f73536df74c4674dd7984cf89e`, in the isolated worktree, from a clean tree. Full `verify:exercise` output for the clean-tree run is captured in `evidence/commands/verify-exercise.txt`.

## Guardrail 1 — `verify:exercise` leaves the tree untouched

A verification step that modifies tracked files is a defect; `git status --porcelain` must be empty after the run.

Commands (from `08 Evidence-led PRs/exercise-01-pr-evidence-pack-automation/pr-evidence-app/`):

```bash
npm run verify:exercise > /tmp/g1-verify-exercise.log 2>&1; echo "exit=$?"
git status --porcelain
```

Output and exit codes:

```text
exit=0
git status --porcelain produced no output (empty)
```

The run passed all three stages — `agent:check` (integrity: "Verified 22 protected challenge inputs.", lint, verifier self-test, agent-check, format, typecheck, build), `verify:implementation`, and `verify:submission` ("Verified Failure-Preserving PR Evidence Pack: 9 files and 4 directories.") — with the six PASS lines and `Source SHA: 70def5638a1604d0d1e8708bc7f5016674144403` in `evidence:verify`. Verdict: **PASS** — no tracked file was modified by verification.

## Guardrail 2 — result does not depend on modified protected inputs

Restoring every path listed in `challenge-integrity.json` from `upstream/main` must leave `verify:exercise` green. This proves no protected input was modified on this branch (restored bytes are identical, so the tree stays clean) and that the gates genuinely check the protected content.

Commands (first from the exercise root, then from `pr-evidence-app/`):

```bash
git checkout upstream/main -- \
  "../README.md" \
  "../docs/pr-brief.md" \
  "../docs/evidence-fixtures.md" \
  "../docs/evidence-contract.md" \
  "../docs/action-pins.json" \
  "../fixtures/check-results.json" \
  "../fixtures/check-results-pass.json" \
  "../fixtures/artifacts/unit-tests.txt" \
  "../fixtures/artifacts/checkout-smoke.txt" \
  "../fixtures/artifacts/build.txt" \
  "../fixtures/artifacts/checkout.svg" \
  "package.json" \
  "package-lock.json" \
  "lab-contract.json" \
  "submission-contract.json" \
  "scripts/agent-check.mjs" \
  "scripts/format-check.mjs" \
  "scripts/lint-check.mjs" \
  "scripts/evidence-verification.mjs" \
  "scripts/verify-evidence-submission.mjs" \
  "scripts/test-evidence-verifier.mjs" \
  "src/labContract.ts"
echo "checkout-exit=$?"

npm run verify:exercise > /tmp/g2-verify-exercise.log 2>&1; echo "verify-after-restore-exit=$?"
git status --porcelain
```

Output and exit codes:

```text
checkout-exit=0
verify-after-restore-exit=0
git status --porcelain produced no output (empty)
```

Final lines of the restored-input run:

```text
PASS Git history contains the generator and workflow at source SHA; later changes are evidence only
PASS verified evidence contract for 08 Evidence-led PRs/exercise-01-pr-evidence-pack-automation
Verified Failure-Preserving PR Evidence Pack: 9 files and 4 directories.
```

Verdict: **PASS** — with all 22 protected paths forced to their `upstream/main` bytes, every gate still passes, including `test:integrity` ("Verified 22 protected challenge inputs."), and the tree remains clean. The result does not depend on any modified protected input.

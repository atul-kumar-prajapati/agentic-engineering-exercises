# 08.1 PR Evidence Pack Automation — learnings for a future run of me

Written after delivery + independent audit (submission mergeable; two guardrail artifacts were added post-audit as an evidence-only commit `e14e4e6`).

## What the verification chain actually required, and in what order

Read `pr-evidence-app/scripts/evidence-verification.mjs` before planning — it encodes ordering constraints no README states:

1. **Commit the implementation first.** The submitted pack's `sourceSha` must be a full 40-char ancestor commit that *contains both* the generator and the workflow (`git show <sha>:<path>` is checked). That commit's tip becomes `sourceSha`.
2. **Generate the pack from that tip**: `npm run evidence:generate -- --sha <tip>` — and only ever point it at the failing fixture for the submitted `evidence/generated/`. Running the pass fixture into the same output dir leaves a stale `artifacts/` mismatch (the harness checks the directory contains *exactly* the fixture's basenames — it runs generator cases in temp dirs, but the submitted pack is checked in place).
3. **Capture gate output while HEAD names the right SHA** (`evidence/commands/evidence-verify.txt` must contain the six PASS lines and the SHA).
4. **Commit evidence last.** After `sourceSha`, only `evidence/` may change — and note `verifyGitBinding` diffs `--name-only sourceSha` against the **working tree**, not HEAD. Final verification must run on a clean tree.

Generator contract details that are easy to miss: `fixtureSha256` hashes the exact fixture *bytes*; artifact copies must be byte-identical with pack-relative `artifacts/<basename>` paths; invalid fixtures (path escape, result/exitCode mismatch, duplicate basenames, missing artifacts, non-40-hex SHA) must exit non-zero *without* writing `pr-evidence.json`; `process.exitCode` is set only after the whole pack is written.

Workflow gate (all individually enforced): top-level `permissions` containing **only** `contents: read`; exactly one job on `ubuntu-24.04`; `timeout-minutes <= 10`; the three actions pinned to the exact SHAs in `docs/action-pins.json`; `persist-credentials: false`; setup-node with `.nvmrc` + `cache: npm` + the app lockfile as `cache-dependency-path`; an `npm ci` step matching `/^npm ci\s*$/m` exactly; `github.sha` passed to generate **and** in the artifact name; `if: always()` on verify **and** upload; upload path exactly `08 Evidence-led PRs/exercise-01-pr-evidence-pack-automation/evidence/generated` with `if-no-files-found: error` and `retention-days` 1–7. Forbidden strings anywhere in the file, comments included: `pull_request_target`, `continue-on-error`, `secrets.`.

## Harness quirks, and one thing it cannot catch

- **No unsatisfiable chain in 8.1** (unlike 8.2's sibling). The cheap probes that settle this in minutes: does `.nvmrc` exist at root (yes); does `action-pins.json` carry full SHAs (yes); is the `--sha`-less `evidence:generate` script a problem (no — CI passes `-- --sha`, and the verifier invokes the generator directly).
- The harness never runs the generator against the submitted `evidence/generated/` in place — its dynamic checks use temp dirs. A stale or wrong-content `evidence/generated/` only surfaces through the submitted-pack check. Generate the submitted pack exactly once, from the right SHA and the failing fixture.
- `test:evidence-verifier.mjs` embeds a complete reference generator and workflow — reading it *is* reading the spec. The verifier is stricter than the README; trust it over prose.

## Environment hazard (cost me two commits)

A parallel exercise session can switch the shared main worktree's HEAD mid-run — my first two commits landed on the sibling exercise's branch. Recovery: `git reset --soft <foreign-tip> && git restore --staged <my files>` (never touch the foreign commits), then move to a `git worktree add` at a temp path and do everything there. **Prevention: create the dedicated worktree before the first commit.**

## Habits that most improved the result vs 7.3

- **One commit, one subject.** Generator / workflow / evidence as three honest commits. Held through the audit.
- **Matched-condition attempts as parallel subagents with disjoint worktrees**: before-attempt on a `-before` branch from the same base with a deliberately plain prompt; after-attempt with the repo's own contracts as its only extra input. The independent variable is explicit and `comparison.md` states it.
- **Deciding not to manufacture a worse baseline.** The before session produced an accurate summary — every failure, digest, and guidance string survived. The tempting move is to quietly make the before attempt look worse. What's actually true: the exercise's stated premise ("PRs look green because failures are omitted") didn't match what happened; the real finding was that a correct-looking *document* enforces nothing — no commit binding, no executable exit status, no validation, no CI upload. Record the contradiction plainly, analyze what the correct summary cannot enforce, and never degrade evidence to flatter the after result. An honest "the baseline was fine" comparison is more valuable than a dramatic one.
- **Independent re-derivation of subagent claims.** Both sessions reported accurate verification; I still re-ran the generator cases and `verifyWorkflow` inline before committing. Reported ≠ proven.
- **Record every check the user asks for, as a file, not a message.** The 8.1 audit's only finding: I ran both guardrails (post-`verify:exercise` porcelain; restore-all-protected-paths-from-upstream then re-verify) and reported them in my final message, but never committed them as evidence. An unreported check is not evidence — if a check matters, it belongs in `evidence/` with exact commands, output, and exit codes. Fixed in `evidence/guardrails.md` + `evidence/commands/verify-exercise.txt`.
- **zsh footgun:** `echo ====` inside a `;`-chain aborts the whole line (`=word` expansion) and silently skips later redirects. Verify redirected files exist immediately (`wc -l`).
- **Keep learnings in two places:** pasted in the final message AND committed to a dedicated branch (`chore/agent-learnings-opencode`, `.agent-learnings/<agent>-<exercise>.md`) — untracked directories get lost.

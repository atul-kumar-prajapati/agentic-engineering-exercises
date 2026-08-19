# Learnings — opencode runs (exercise-delivery skill)

Read at the start of every delivery, alongside every other `LEARNINGS-*.md` in this directory — another agent's file is where you get lessons you have not paid for yet. Append a section per exercise; never edit another agent's file, and never edit `SKILL.md` (propose promotions to the user instead). Push this file to `chore/agentic-exercise-delivery-skill` at the end of the session — see `SKILL.md` Phase 8.

**Already promoted into `SKILL.md`** — do not re-derive or re-record these, they are binding rules now: worktree-before-first-commit and the shared-checkout recovery; the unsatisfiability probe; the zsh `=word` redirect trap; verify subagent claims yourself, including clean verdicts; one subject per commit; never manufacture a worse baseline; an unreported check is not evidence; the two standing guardrails; the generate-the-submitted-pack-once rule; naming the artifact your line citations refer to and re-deriving against it; re-deriving every count you write in prose; running the supplied tool against the fixed state as well as the broken one; declaring the evidence file list in the Phase 2 brief and pasting the Phase 5 checklist in the report.

What stays here: per-exercise specifics, and anything still too fresh or too opencode-specific to be a shared rule.

## The harness (highest value)

- **A parallel exercise session may share this repository checkout.** During 8.1 another session switched the main worktree's HEAD to its own branch mid-run; my first two commits landed on the wrong branch. Fix used: `git reset --soft <foreign-tip> && git restore --staged <my files>` (never touching the foreign commits), then `git worktree add <tmpdir> <my-branch>` and do **all** remaining work in that isolated worktree. Next run: create the dedicated worktree *before* the first commit, not after losing one.
- `verifyGitBinding` (8.1's `evidence-verification.mjs`) diffs `--name-only sourceSha` against the **working tree**, not HEAD. A clean tree at final verification is mandatory; untracked-but-ignored output (`node_modules/`, `dist/`, `*.tsbuildinfo`) is fine because the repo `.gitignore` covers them.
- Commit order that satisfies SHA binding everywhere: (1) implementation commit(s) → that tip is `sourceSha` and must contain generator + workflow; (2) generate the pack with `--sha <that tip>`; (3) capture gate output naming the SHA; (4) one evidence-only commit last. Nothing outside `evidence/` may change after `sourceSha`.
- The 8.1 verify chain was fully satisfiable — no 8.2-style dead end. `.nvmrc` exists at root; `action-pins.json` carries full SHAs; `evidence:generate` omits `--sha` in package.json but CI supplies it via `-- --sha` and the verifier invokes the generator directly. Check these three things first next time; they are the cheap unsatisfiability probes.
- Workflow gate specifics that bite: `permissions` is read from the **top level only**; `npm ci` must match `/^npm ci\s*$/m` exactly; `if: always()` needed on verify **and** upload; `retention-days` 1–7; and the strings `pull_request_target`, `continue-on-error`, `secrets.` are forbidden **anywhere** in the file including comments.
- Size floors (900/1200/1500/1000/600/450 chars) were all reachable with genuine substance — substance only, never filler, per user calibration.

## Session craft

- Matched-condition before/after attempts work well as two parallel read-then-write subagents with disjoint worktrees (one on a `-before` branch from the same base, one on the exercise branch). Give the before agent a deliberately plain prompt; give the after agent the repo's own contracts as its extra input — that is the independent variable, and say so in `comparison.md`.
- A "too good" before attempt is not a problem to fix. 8.1's unstructured attempt preserved every failure and digest; the honest comparison was about what a correct document cannot *enforce* (no commit binding, no executable exit status, no validation, no CI upload). Report reality; don't manufacture a worse baseline.
- zsh gotcha that silently skipped a redirect: `echo ====` in a `;` chain aborts the *entire* command line (`=word` expansion). Verify redirected artifacts exist immediately after writing them (`wc -l`).
- Verify every subagent claim yourself. Both 8.1 subagents reported accurate verification results, but I still re-ran the generator cases and `verifyWorkflow` inline before committing — cheap, and it is the difference between reported and proven.
- Commits: one subject per commit (`generator`, `workflow`, `evidence`) — user calibration from 7.3 applied.

## Verification discipline that paid off

- Run the gate loop with `npm run "$s" >/dev/null 2>&1; echo $?` per script, then `git status --porcelain` (must be empty), then the protected-path guardrail: `git checkout upstream/main -- <all 22 protected paths>` → `verify:exercise` again → still exit 0, still clean. Record all of it.
- `npm run verify:exercise` in 8.1 does **not** run the generator against the submitted `evidence/generated/` in place (it uses temp dirs), so a stale `artifacts/` leftover from running the pass fixture into `evidence/generated/` would only surface via the submitted-pack check. Only ever point `evidence:generate` at the failing fixture.

## 9.1 — security/a11y review gauntlet

- **The shipped `semgrep.yml` cannot run — twice over.** It is invalid YAML (unquoted pattern contains `__html: $SOURCE`, i.e. colon+space in a plain scalar) *and* its literal pattern `<... dangerouslySetInnerHTML={{ __html: $SOURCE }} ... />` fails semgrep pattern parsing ("no pattern found") even after quoting. Working equivalent: pattern `"<$EL dangerouslySetInnerHTML={{ __html: $SOURCE }} />"` with the same id/message/severity/languages. Run it against a clone of the bundle head, document the substitution in `evidence/semgrep.txt`, never touch the protected file. Semgrep was also absent from the machine — installed into a throwaway venv under the opencode temp dir, not globally.
- **Findings' `line` values reference the review head inside the bundle, not the working tree.** `review-expectations.json` pins SEC-001→ActionComposer.tsx:31, VAL-001→:48, A11Y-001→WorkQueue.tsx:16 — those are the bundle head's (expanded-formatting) line numbers; the working-tree starter is a condensed reformat with different numbering. Clone the bundle and confirm each pinned line before writing `review.json`; the verifier compares fields exactly.
- **`tests/` is type-checked (tsconfig includes it) but there is no @types/node and package.json is protected** — `node:fs` imports fail typecheck. Use Vite `?raw` imports plus a small `tests/raw-modules.d.ts` ambient `declare module "*?raw"` (the declaration must be a .d.ts; inline in the test file it becomes an invalid augmentation).
- **`verifyGitBinding` here is the 7.1 pattern:** implementation commit (fixes + learner tests) = `sourceSha`; then write evidence; capture `npm run review:verify` while HEAD == sourceSha (untracked evidence files are invisible to `git diff --name-only sourceSha`, so this works); then one evidence-only commit. Nothing outside `evidence/` may change after `sourceSha`.
- **zsh/BSD gotcha that cost a re-run:** `xargs -I{} git checkout upstream/main -- "{}}"` injects a literal `}`; use a `while IFS= read -r p` loop over the protected-path list (the LEARNINGS-cursor fix, still relevant on BSD xargs).
- A one-word test-fixture bug: `"approved"` is exactly 8 chars and is NOT a short note — the protected server test's short fixtures are "approve"/"ok"/"1234567". Match that boundary.
- Baseline worth recording: `agent:check` exits 0 on the vulnerable head — the seeded defects are invisible to quality gates; only `test:review`/`review:verify` catch them.

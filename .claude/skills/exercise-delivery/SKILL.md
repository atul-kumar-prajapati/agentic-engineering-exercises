---
name: exercise-delivery
description: Deliver one competency exercise from this agentic-engineering exercises repository end to end — inspect the exercise contract, plan specialist lanes, implement with parallel read-only reviewer subagents, produce the required evidence, run every verification gate, commit in the order the exercise verifier demands, push to the personal fork, and emit PR details. Use whenever the user names an exercise by number ("7.2", "8.1", "exercise-02-codebase-graph-to-diagrams"), says "next exercise", or asks to continue the exercise series. Also use when auditing or repairing an exercise branch that was completed earlier.
---

# Exercise Delivery

One exercise per branch, per PR. The exercise's own README and verifier outrank this skill wherever they are more specific.

## This file works for any agent

Nothing here is specific to one tool. Claude Code loads it as a skill; opencode, Cursor, Codex, Copilot, Aider, or anything else can be pointed at the path and read it as plain working instructions. The YAML frontmatter above is metadata for tools that consume it and is safely ignorable by tools that do not. There is no auto-discovery, no plugin, and no MCP dependency.

What it does assume you can do — all of it ordinary:

| Capability | Used for |
|---|---|
| Read and write files | Everything |
| Run shell commands and see the **exit code** | Every gate; exit codes are the evidence |
| Run `git` (branch, worktree, commit, push) | Phases 1, 6, 8 |
| Run `npm` inside the exercise app | Every gate |

Two things are optional, and the file tells you what to do without them:

- **Subagents / parallel sessions.** Phase 3 uses them for independent review lanes. If your tool has none, run the same lanes yourself sequentially as separate, deliberately adversarial passes, and say in `evidence/specialists/ownership.md` that the lanes were serial rather than parallel. Never claim a parallel review you did not run.
- **Skills / rules / persistent instructions.** If your tool supports them, install this file as one so you do not re-read it every session. Keep it outside the exercise directories. If not, just keep it in context for the session.

If you are the first run of your tool here, you have no `LEARNINGS-<you>.md` yet. That is expected — read the other agents' files, follow this one, and create yours in Phase 8. Nothing in the pipeline is gated on your tool being one that has run before.

## Phase 0 — Who you are, and what the previous runs learned

```bash
ls .claude/skills/exercise-delivery/LEARNINGS-*.md
```

**Read every one of them, not just your own.** Different agents hit different walls; reading the others is how you inherit their scars instead of earning them. Rules that proved durable and agent-independent have already been promoted into this file — the `LEARNINGS-*` files hold the per-exercise specifics and the still-fresh notes.

Then say, in your first message, **which agent you are** — the tool you are running as, plus the exact model slug (`opencode`, `cursor`, `claude-code`, …). That name is your identity for the whole session: it picks your `LEARNINGS-<you>.md` file in Phase 8, and it goes in the evidence.

If no `LEARNINGS-<you>.md` exists, you are the first run of your kind here. Read the others, and create yours in Phase 8.

You only ever write your own file. Never edit another agent's, and never edit `SKILL.md` — if a lesson deserves to become a shared rule, propose it to the user in your final message and let them promote it.

## Non-negotiables

These are the rules that fail a submission when broken.

1. **Never claim a check passed unless you ran it and saw exit 0.** Report the command and the exit code. If something failed, say so with the output.
2. **Never modify a protected input** to make a gate pass. Protected files are listed in the app's `challenge-integrity.json`. This includes verifier scripts, contracts, fixtures, and starter source — and it includes editing one merely to update a hash. When the implementation is wrong, you *document* the contradiction — you do not fix protected source.
3. **An unsatisfiable required gate is a stop, not a footnote.** If a completion criterion can only be met by touching a protected input, or by a self-invalidating hash binding, or cannot be met at all — stop and tell the user **before committing**. A correct diagnosis filed under "remaining uncertainty" while you ship a red required check is still a failed submission. Diagnosing these is high-value work; acting on them is the other half.
4. **An unreported check is not evidence.** Every check this file requires, and every check the user asks for, goes into `evidence/` as a committed file with the exact command, its output, and its exit code. Saying it in chat or in the PR body does not count. This was the *only* finding of both the 8.1 and the 8.2 follow-up audits — in each case the work was done correctly and the submission still failed the audit because the proof lived in a message.
5. **Never shape content to satisfy a checker.** Truncating a diagram to hold a marker count at one, padding prose to clear a size floor — if a check rewards worse content, satisfy it honestly or report it as a design flaw. Size floors have so far always been reachable with real substance. Filler is a defect, not a pass.
6. **Record the exact model slug** — yours and every subagent's — in the launch call and in `evidence/before.md` / `evidence/after.md`. "Inherited model" makes a before/after comparison irreproducible, which defeats its purpose.
7. **Keep the diff inside the one exercise directory.** Nothing else. Verify this before pushing.
8. **Never commit** `.DS_Store`, `node_modules`, build output, `.runtime/`, or `.claude/`. Preserve unrelated untracked files the user already has — never delete someone else's untracked file to force a clean `git status`.
9. **Dependencies stay local to the exercise app** (`npm ci` inside e.g. `07 Docs & Diagrams/exercise-02-.../notification-mesh-app`). Never install globally or at the repo root.
10. **Do not create the PR.** Push the branch and emit PR details; the user raises it.

## Phase 1 — Repository and base

```bash
git remote -v                 # origin = personal fork, upstream = company repo
git fetch --all --prune
```

Pick the base. Two upstream branches carry exercise content:

```bash
git log -1 --format="%H %ci %s" upstream/main
git log -1 --format="%H %ci %s" upstream/feature/improve-exercise-challenges
git diff --stat upstream/main upstream/feature/improve-exercise-challenges
```

If the diff is empty, the trees are identical — use `upstream/main`. If they differ, use the newer tip and **say so in your first message**; a real content divergence is worth the user's attention.

Record the base SHA in full. You will quote it in the evidence and the PR details.

**Branch name** — section number and exercise number, both zero-padded, then the exercise directory's slug:

```
codex/exercise-<SS>-<NN>-<slug>
```

`07 Docs & Diagrams/exercise-02-codebase-graph-to-diagrams` → `codex/exercise-07-02-codebase-graph-to-diagrams`.

```bash
git switch -c codex/exercise-07-02-codebase-graph-to-diagrams <base-sha>
git merge-base HEAD upstream/main    # prove it, record the SHA
```

Check first whether the branch already exists locally or on `origin` — an exercise may already be done. If it is, run its `verify:exercise`, report honestly, and ask the user before redoing work.

### Isolate the session before your first commit

**Another agent may be working in this same checkout right now.** During 8.1 a parallel session switched the shared main worktree's `HEAD` mid-run and two commits landed on the sibling exercise's branch. Recovering cost more than preventing:

```bash
git worktree add /tmp/ex-<SS>-<NN> -b codex/exercise-<SS>-<NN>-<slug> <base-sha>
cd /tmp/ex-<SS>-<NN>
```

Do this **before** the first commit, not after losing one. If you find yourself already contaminated: `git reset --soft <foreign-tip> && git restore --staged <your files>` — never rewrite or drop the other session's commits — then move into a worktree and finish there.

The same isolation is what before/after companion attempts need anyway (Phase 4), so create those worktrees in the same step.

## Phase 2 — Read the contract before touching anything

Read in this order. Do not skip any that exist:

| File | What it tells you |
|---|---|
| `<exercise>/README.md` | The mission, required deliverables, completion criteria |
| `<exercise>/docs/*.md` | Contracts (naming, structure), the evidence template, and any "legacy" document that is a **claim to investigate, not an authority** |
| `<app>/package.json` | Every gate you must run — read the `scripts` block in full |
| `<app>/submission-contract.json` | Exact required files, minimum sizes, required substrings |
| `<app>/challenge-integrity.json` | The protected files you must not touch |
| `<app>/scripts/*verif*.mjs`, `*check*.mjs` | **The real acceptance criteria.** Read these. |
| `<app>/src/**` | The implementation, which is the source of truth over any doc |
| `docs/SUBMISSION_STANDARD.md` | Repo-wide submission rules |

**Read the verifier script properly.** It encodes constraints no README states — required commit ordering, Git ancestry rules, hash bindings, exact counts. Grep it for:

```bash
grep -nE "rev-list|merge-base|diff --name-only|cat-file|sha256|hashFile|source_sha" <app>/scripts/*.mjs
```

In 7.1 this revealed that *every commit after `source_sha` may only touch `evidence/`*, and that diagrams must be byte-identical to their `source_sha` version. Discovering that after committing would have meant redoing the history. Find these before you plan.

Where a verifier embeds a reference implementation in its own test file (8.1's `test:evidence-verifier.mjs` carried a complete reference generator and workflow), **reading that file is reading the spec.** The verifier is stricter than the README; trust it over prose.

### The unsatisfiability probe — run it before you plan, not after you commit

Non-negotiable 3 says an unsatisfiable gate is a stop. Settling that takes minutes if you probe deliberately, and costs a whole session if you discover it at commit time. Ask, concretely:

1. **Is there a hash or SHA cycle?** Does a file that must exist *inside* commit `X` record a value derived *from* commit `X`, or from bytes that the verification step itself regenerates? That is the 7.2 trap and it is unsatisfiable. Contrast it with the benign 7.1/8.2 shape, where the SHA is an *argument* passed into a generator whose output lands in a later evidence-only commit. Distinguish the two before writing code.
2. **Does every input the gate demands actually exist?** (8.1: does `.nvmrc` exist at root? does `action-pins.json` carry full 40-char SHAs?) Missing inputs are cheap to check and fatal to discover late.
3. **Does the verifier compare against `HEAD` or against the working tree?** 8.1's `verifyGitBinding` diffs `--name-only sourceSha` against the **working tree** — so final verification demands a clean tree, and an uncommitted evidence file will silently pass a binding check it should not.
4. **Does the gate's required count match what the tooling can produce?** (8.2: capture scripts emit three scenarios; the brief and the test require five states.) A shortfall like this is usually a *harness limitation you prove around*, not an unsatisfiable gate — enumerate the missing states by another honest route and cite source. Do not invent an extra fixture to close the gap.
5. **Can any required gate only pass by editing a protected path?** If yes — stop, now, before the first commit.

Report the answers in your Phase 2 brief, including the ones that came back clean. "I checked for a hash cycle and there isn't one" is worth saying.

Then run the integrity gate to confirm a clean start, and install deps:

```bash
cd "<app>" && npm ci && npm run test:integrity
```

Present a short brief and then work autonomously. The brief covers, in this order:

1. What the exercise is about and what competency it teaches, in plain language.
2. The required deliverables and the protected files.
3. **Every state, case, or path the exercise's own brief names — enumerated in full, each to be proved separately.** The brief is where the real bar is set, and it is routinely stricter than the deliverable list. 8.2's flag brief required five states (enabled, disabled, invalid context, provider failure, preview-API failure) while the capture tooling emitted three; a three-state pack would have passed the verifier and missed the point. Count them yourself, from the brief, before you plan.
4. Every ordering, ancestry, or hash-binding constraint you found **by reading the verifier scripts** — not by reading the README.
5. The unsatisfiability probe results, including the clean ones. Anything the harness makes impossible.
6. Your specialist lane plan, each lane's scope and its ownership boundary.
7. **The evidence file list you are going to commit, `evidence/guardrails.md` included, written out by name.** Declaring it here is what stops it being forgotten at the end. If `evidence/guardrails.md` is not in the list you type, the brief is incomplete.

## Phase 3 — Specialist subagents

Use them when the exercise calls for independent review — security, accessibility, performance, reliability, provenance, semantics, evidence integrity. Not every exercise does; read the README.

**Launch all specialists in a single message so they run in parallel.**

Each specialist gets, explicitly:

- **A concrete scope** — what it owns.
- **An ownership boundary** — name the other lanes and say they are out of bounds. Overlapping lanes produce duplicate findings and contradictory edits.
- **Read-only status** — reviewers must not create, edit, or delete files, and must not run mutating Git commands. Only you, the integration owner, write.
- **Its own verification command** — the npm script that backs its lane.
- **An expected output shape** — a verdict, a per-item table, file:line for every defect.
- **An adversarial instruction** — "your job is to find something wrong, not to rubber-stamp; if you genuinely find nothing, say so and list what you checked."

Where an exercise instead wants parallel *implementation* lanes (e.g. worktree splits), give each lane a disjoint file set and use `isolation: "worktree"` so they cannot collide.

**You stay accountable.** Verify every specialist claim against the source yourself before acting on it. Reported is not proven. Subagents report confidently and are sometimes wrong — in 7.1 two independent reviewers converged on a "reversed arrow" defect that was actually correct under the file's own convention, and rejecting it was the right call. This applies just as hard to *clean* verdicts: in 8.1 both subagents reported accurate verification and the generator cases were still re-run inline before committing; in 8.2 the integration owner re-ran `executeScenario` and a throwaway rollback copy before accepting three clean lanes.

**The evidence bar:**

- Every claim carries `file:line` (or `path:line` at a named SHA). Every cited line must survive independent re-derivation — off-by-one citations are defects, and fixing them belongs before the evidence commit, not after (`run-rollout-tests.mjs:27` was actually `:26`).
- **Name the artifact your line numbers refer to, and re-derive them against that artifact — not against whatever file is open.** An exercise may pin expected lines to a protected fixture, a Git bundle, or a specific SHA whose formatting differs from the checked-in working tree. In 9.1 the same sink sat at line 28 in the app you read and line 31 in the bundle the verifier compares against; `review-expectations.json` demanded 31. Find out which tree is authoritative *before* writing citations, then check every one against it.
- Every **dismissed** claim gets its own evidence, written down with the reasoning. A review round where everything was accepted, or where nothing was recorded as rejected, is a review that did not happen.
- **Re-derive every count you write in prose** — test cases, findings, states, scenarios. Counting from memory is how "13 assertions" ends up in a file describing 12 test cases (9.1's `comparison.md`). If you state a number, you counted it that minute.

## Phase 4 — Evidence

Produce exactly what the exercise's `docs/evidence-template.md` and `submission-contract.json` require — no more, no fewer. Typical set:

- `evidence/before.md` + `before.patch`, `evidence/after.md` + `after.patch` — genuine first-attempt artifacts under **matched session conditions** (same agent, model, tools, permissions, time limit, first-attempt rule). The only difference between them is the exercise's independent variable.
- `evidence/specialists/ownership.md` — the scope/boundary/output/command/write-permission table.
- `evidence/specialists/<lane>-handoff.md` — one per specialist, with accept / fix / defer per finding.
- `evidence/integration.md` — prioritisation and per-finding disposition, including what you **rejected** and why.
- `evidence/verification.md` — exact commands, results, exit codes.
- `evidence/guardrails.md` — the two standing guardrails from Phase 5. Always. See non-negotiable 4.
- `evidence/commands/*.txt` — captured command output, redirected exactly as the template specifies.
- A manifest recording SHA-256 hashes and the source SHA, when the exercise uses one.

### Before/after attempts: measure, do not manufacture

Run them as two parallel subagents in **disjoint worktrees** from the same starting SHA — the before attempt on a `-before` branch with a deliberately plain prompt, the after attempt with the repo's own contracts as its only extra input. That difference *is* the independent variable; name it explicitly in `comparison.md`, along with both model slugs.

**A "too good" baseline is a finding, not a problem to fix.** 8.1's unstructured before attempt produced an accurate summary — every failure, digest, and guidance string survived, contradicting the exercise's own premise that "PRs look green because failures are omitted." The tempting move is to quietly degrade the baseline so the after result looks dramatic. Do not. Record the contradiction plainly and analyse what the correct-looking artifact still *cannot enforce* — in that case: no commit binding, no executable exit status, no validation, no CI upload. An honest "the baseline was already fine" comparison is worth more than a manufactured one.

Symmetrically, do not assume the baseline is uniformly wrong. 8.2's ordinary first attempt got the default and the enabled telemetry payload right and still failed on mismatched targeting keys, wrong reason tokens, and a rollback that accepted `not-a-timestamp` and mutated anyway. Measure it.

`after.patch` must stay the unaided attempt. If integration later changed the code, say so and prove which blobs moved.

**Hashes and captured output are order-sensitive.** If a manifest records `source_sha` and file hashes:

1. Commit the source/deliverable files first — that commit becomes `source_sha`.
2. Re-capture command output **while `HEAD` equals that commit**, so the output names the right SHA.
3. Recompute every hash (`shasum -a 256 <files>`) against the final bytes.
4. Commit the evidence separately.

Any later edit to a hashed file means redoing steps 2–4.

## Phase 5 — Verification

Run **every** script the exercise defines, individually, and capture real exit codes:

```bash
cd "<app>"
for s in test:integrity lint test format typecheck build verify:implementation verify:submission agent:check verify:exercise; do
  npm run "$s" >/dev/null 2>&1; printf '%-22s exit=%s\n' "$s" "$?"
done
```

Substitute the actual script names from that exercise's `package.json`. Report only the ones that ran and passed. A gate that does not exist is not a gate you claim.

Re-run `verify:exercise` **after your final commit** — verifiers inspect Git history, so a passing run before the last commit proves nothing about the submitted state.

### The two standing guardrails — run both, record both in `evidence/guardrails.md`

These are required on every exercise whether or not the exercise's own README mentions them. Recording them is not optional (non-negotiable 4).

**1. Verification must not mutate tracked files.**

```bash
git status --porcelain --untracked-files=no   # before
npm run verify:exercise                        # in the app dir
git status --porcelain --untracked-files=no   # after — must be empty, and identical
```

A verification step that modifies tracked files is a **defect in the exercise** — report it as one. Capture full `git status --porcelain` before and after too, and diff the two listings. Pre-existing `??` lines outside the exercise (`.claude/`, `.DS_Store`, a sibling exercise's in-progress files) are not a violation as long as the before/after listings are identical — state that explicitly rather than silently deleting the user's untracked files to force a blank porcelain. Ignored build output (`dist/`, `*.tsbuildinfo`, `node_modules/`) is not a dirty tree.

**2. Restoring every protected path must change nothing.**

```bash
while IFS= read -r p; do git checkout upstream/main -- "$p"; done < protected-paths.txt
# then, in the app dir:
npm run verify:exercise      # still exit 0
git diff HEAD                # still empty
```

Quote the path and use a `read` loop — `git checkout upstream/main -- $(cat paths.txt)` word-splits on the spaces in `08 Evidence-led PRs` and silently restores the wrong things. Restore only paths actually listed in `challenge-integrity.json`; files you were *supposed* to edit are not protected and must not be "restored" (8.2's `invoicePreview.mjs` is not in the list).

Record for both guardrails: the exact commands, the exit codes, and the before/after output — in `evidence/guardrails.md`, committed. The 8.1, 8.2, and 9.1 audits all failed on exactly this: the checks were run correctly and reported in chat, and that was not enough. In 9.1 the run even described hitting a shell bug *while running the restore loop*, and still shipped without the file.

### Independent recheck: run the tool against the fixed state too

When an exercise hands you a scanner, linter, audit, or capture tool, running it on the broken state proves the finding. Running it again on the **fixed** state is what proves the fix — and it is the step most often skipped, because the fix already looks obvious. Do both, and put both outputs in the evidence.

Where the broken state is genuinely immutable (a protected bundle, a pinned commit), run the tool against your fixed working tree instead and say plainly which tree each run covered. 9.1 skipped this: it had semgrep installed and scanned only the vulnerable bundle head, so nothing in the evidence shows the scanner dropping from 2 findings to 1 — the exact proof that the true positive died and the deliberate false positive survived.

### Before the evidence commit, paste this checklist with real answers

Not a formality. Each line is a check that has failed a real submission. Fill it in, in your own output, before the final commit:

```
[ ] Every gate in package.json ran individually; exit codes recorded     -> evidence/verification.md
[ ] verify:exercise re-run AFTER the final commit                        -> exit ?
[ ] Guardrail 1, porcelain unchanged, before/after captured              -> evidence/guardrails.md
[ ] Guardrail 2, all <N> protected paths restored, still exit 0          -> evidence/guardrails.md
[ ] Tool run against the BROKEN state                                    -> evidence/<file>
[ ] Tool run against the FIXED state                                     -> evidence/<file>
[ ] Every finding's file:line re-derived against the artifact the
    verifier compares to (working tree? bundle? pinned SHA? — name it)
[ ] Model slug recorded for me and every subagent                        -> evidence/before.md, after.md
[ ] Counts in prose re-derived (test cases, findings, states) — no
    number written from memory
[ ] git diff --name-only <sourceSha> lists only evidence/
[ ] Diff scoped to this one exercise directory
[ ] Nothing staged from .claude/, .DS_Store, node_modules, build output
```

If a line does not apply to this exercise, write "n/a" and why. Do not silently drop it.

## Phase 6 — Commit and push

Respect any ordering constraint found in Phase 2. **One subject per commit** — implementation, tooling, and evidence are separate honest commits, not one squashed "done" commit. Stage by path, never `git add -A`:

```bash
git add "<exercise-dir>/<subpath>"
git status --short | grep -v '^??'          # confirm what is staged
```

Then confirm the total scope and that protected inputs are untouched:

```bash
git diff --name-only <base-sha> HEAD | grep -v "^<exercise-dir>/" || echo "fully scoped"
git diff --name-only <base-sha> HEAD -- <protected paths from challenge-integrity.json>   # must be empty
```

Push to the personal fork only:

```bash
git push -u origin <branch>
```

Push companion branches too when the exercise requires them to stay remotely inspectable (before/after attempts, parallel lanes). Never push to `upstream`.

## Phase 7 — PR details

Emit this and stop. Do not open the PR.

```
Branch:        codex/exercise-<SS>-<NN>-<slug>
Base:          main @ <full base SHA>
Final commit:  <full SHA>
Compare link:  https://github.com/codewalnut-labs/agentic-engineering-full-exercises-set/compare/main...atul-kumar-prajapati:agentic-engineering-exercises:<branch>
PR title:      Exercise <S>.<N>: <concise outcome>
```

Then a concise description with only the sections that apply: **Summary** (what was completed and how specialists contributed) · **What Changed** (short subsections) · **Specialist Review Evidence** (scope, findings, disposition per lane) · **Integration** (how findings were prioritised, implemented, rejected, deferred) · **Verification** (only checks that actually passed) · **Notes** (base branch, base SHA, exercise branch, final commit, exercise scope, protected-input status, confirmation that unrelated files were excluded).

Then paste the **completed Phase 5 checklist** with its real answers, and list the evidence files you committed. If any line came back "n/a", it says so there. A finished report that does not contain the checklist is not finished.

Anything you found that is wrong with the *exercise itself* — an input that cannot run, expected values that do not match the shipped files, a gate that contradicts the README — goes in a short **Exercise defects** section. Those are worth more to the user than the submission is: every future learner hits them.

## Phase 8 — Close the loop: write your learnings

A required deliverable, not a nicety. It is the mechanism by which the next run — yours or another agent's — starts ahead of where you started.

Add a section for this exercise to `.claude/skills/exercise-delivery/LEARNINGS-<you>.md`, using the identity you declared in Phase 0. Create the file if it does not exist. Append; do not rewrite history that is still true. Prune only what a later run has actually disproved, and say so when you do.

Write it as instructions to a future run of yourself, not as a report of what you did. What earns a place:

- A constraint the verifier encoded that no README stated, and the order it forced.
- Something the harness makes awkward or impossible, and the honest way around it.
- An environment or shell hazard that cost you time, with the exact recovery.
- A habit that measurably improved the result over your last run — and one that did not.
- The model slug you ran under.

What does not: narration, a summary of the exercise, or anything already covered above in this file. If something belongs in `SKILL.md` instead, say so in your final message — do not edit it yourself.

**Then commit it.** One branch holds the skill and every agent's learnings; it is not per-agent and not per-exercise:

```bash
git fetch origin chore/agentic-exercise-delivery-skill
git worktree add /tmp/skill-branch chore/agentic-exercise-delivery-skill   # never on the exercise branch
cp .claude/skills/exercise-delivery/LEARNINGS-<you>.md /tmp/skill-branch/.claude/skills/exercise-delivery/
cd /tmp/skill-branch
git add .claude/skills/exercise-delivery/LEARNINGS-<you>.md
git commit -m "learnings(<you>): exercise <S>.<N>"
git push origin chore/agentic-exercise-delivery-skill
```

Then clean up, or you break the next agent:

```bash
cd -                                      # back out of the worktree first
git worktree remove /tmp/skill-branch
```

**Do not skip this.** A left-behind registration makes the next session's `git worktree add` fail with `fatal: 'chore/agentic-exercise-delivery-skill' is already used by worktree at /tmp/skill-branch` — a real failure that has already happened. If you hit it, the previous run forgot: check whether that path is clean, use it if it is, and remove it when you are done. Same applies to the before/after worktrees from Phase 4 — remove them, then `git worktree prune`.

Use a worktree so the exercise branch's tree stays clean — `.claude/` must never enter an exercise commit. If the push is rejected, `git pull --rebase` first: another agent may have landed its own learnings since you fetched. Your file and theirs never conflict.

Also paste the new section in your final message, so the user sees it without checking out anything.

## Session hazards

Small things that have each cost a real session:

- **Paths with spaces.** A tool's `working_directory` parameter is unreliable when the path contains spaces. Put `cd "08 Evidence-led PRs/<exercise>/<app>"` inside the command instead. Never trust a persisted cwd after a worktree `cd`.
- **zsh `=word` expansion.** `echo ====` inside a `;`-chain aborts the *entire* command line, silently skipping every later redirect on it. After writing any redirected artifact, confirm it exists immediately (`wc -l <file>`).
- **A shared checkout.** See Phase 1. Worktree first.
- **Generator output directories.** When a generator writes into a checked-in output dir, generate the submitted pack exactly **once**, from the right SHA and the right fixture. A stale artifact left by an earlier run against a different fixture may not surface in the dynamic checks (which use temp dirs) and will only fail at the submitted-pack check.

## Cost discipline

Credits are limited. Spend them on verification, not on narration.

- Batch independent tool calls into one message.
- Read the verifier and contracts directly; do not send a subagent to summarise a file you can read in one call.
- Use subagents for genuine parallel review breadth, not for work you would do faster inline.
- Do not re-read a file you just edited to confirm the edit.
- Skip status narration between steps; report once at the end with the evidence.

## Escalate only when it genuinely blocks

Handle routine judgment calls yourself. Come back to the user — **before committing**, not in a footnote afterwards — for:

- A required gate that cannot be satisfied at all, or only by touching a protected input or updating a hash inside a protected file.
- A self-invalidating binding: a required artifact that must record a value the verification step regenerates (the 7.2 cycle).
- A check that can only pass by making the content worse.
- A verification step that mutates tracked files.
- A real content divergence between the two upstream branches.
- An exercise that is already complete and pushed.
- A missing external dependency the exercise names as the competency under test.

Otherwise state your assumption in the final report and keep going.

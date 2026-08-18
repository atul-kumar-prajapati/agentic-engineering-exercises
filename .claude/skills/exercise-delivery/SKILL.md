---
name: exercise-delivery
description: Deliver one competency exercise from this agentic-engineering exercises repository end to end — inspect the exercise contract, plan specialist lanes, implement with parallel read-only reviewer subagents, produce the required evidence, run every verification gate, commit in the order the exercise verifier demands, push to the personal fork, and emit PR details. Use whenever the user names an exercise by number ("7.2", "8.1", "exercise-02-codebase-graph-to-diagrams"), says "next exercise", or asks to continue the exercise series. Also use when auditing or repairing an exercise branch that was completed earlier.
---

# Exercise Delivery

One exercise per branch, per PR. The exercise's own README and verifier outrank this skill wherever they are more specific.

This file is self-contained. Claude Code loads it as a skill; any other agent can be pointed at the path and read it directly as its working instructions — nothing here depends on skill auto-discovery. The frontmatter above is metadata for tools that use it and can be ignored by tools that do not.

## Non-negotiables

These are the rules that fail a submission when broken.

1. **Never claim a check passed unless you ran it and saw exit 0.** Report the command and the exit code. If something failed, say so with the output.
2. **Never modify a protected input** to make a gate pass. Protected files are listed in the app's `challenge-integrity.json`. This includes verifier scripts, contracts, fixtures, and starter source. When the implementation is wrong, you *document* the contradiction — you do not fix protected source.
3. **Keep the diff inside the one exercise directory.** Nothing else. Verify this before pushing.
4. **Never commit** `.DS_Store`, `node_modules`, build output, `.runtime/`, or `.claude/`. Preserve unrelated untracked files the user already has.
5. **Dependencies stay local to the exercise app** (`npm ci` inside e.g. `07 Docs & Diagrams/exercise-02-.../notification-mesh-app`). Never install globally or at the repo root.
6. **Do not create the PR.** Push the branch and emit PR details; the user raises it.

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

Then run the integrity gate to confirm a clean start, and install deps:

```bash
cd "<app>" && npm ci && npm run test:integrity
```

Present a short plan: deliverables, specialist lanes, ordering constraints found, protected files. Then work autonomously.

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

**You stay accountable.** Verify every specialist claim against the source yourself before acting on it. Subagents report confidently and are sometimes wrong — in 7.1 two independent reviewers converged on a "reversed arrow" defect that was actually correct under the file's own convention, and rejecting it was the right call. Record rejected findings with the reasoning; a review round where everything is accepted is a review that did not happen.

## Phase 4 — Evidence

Produce exactly what the exercise's `docs/evidence-template.md` and `submission-contract.json` require — no more, no fewer. Typical set:

- `evidence/before.md` + `before.patch`, `evidence/after.md` + `after.patch` — genuine first-attempt artifacts under **matched session conditions** (same agent, model, tools, permissions, time limit, first-attempt rule). The only difference between them is the exercise's independent variable.
- `evidence/specialists/ownership.md` — the scope/boundary/output/command/write-permission table.
- `evidence/specialists/<lane>-handoff.md` — one per specialist, with accept / fix / defer per finding.
- `evidence/integration.md` — prioritisation and per-finding disposition, including what you **rejected** and why.
- `evidence/verification.md` — exact commands, results, exit codes.
- `evidence/commands/*.txt` — captured command output, redirected exactly as the template specifies.
- A manifest recording SHA-256 hashes and the source SHA, when the exercise uses one.

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

## Phase 6 — Commit and push

Respect any ordering constraint found in Phase 2. Stage by path, never `git add -A`:

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

## Cost discipline

Credits are limited. Spend them on verification, not on narration.

- Batch independent tool calls into one message.
- Read the verifier and contracts directly; do not send a subagent to summarise a file you can read in one call.
- Use subagents for genuine parallel review breadth, not for work you would do faster inline.
- Do not re-read a file you just edited to confirm the edit.
- Skip status narration between steps; report once at the end with the evidence.

## Escalate only when it genuinely blocks

Handle routine judgment calls yourself. Come back to the user for: a real content divergence between the two upstream branches; an exercise that is already complete and pushed; a requirement that cannot be satisfied without touching a protected input; or a missing external dependency the exercise names as the competency under test. Otherwise state your assumption in the final report and keep going.

# Handoff Prompt

Paste this into a fresh session opened at the repository root. Change the first line. Nothing else.

## Copy from here

Next exercise: **`09 Code Review/exercise-02-diff-triage-with-fresh-agent`**

Read `.claude/skills/exercise-delivery/SKILL.md` and follow it as your working instructions for the whole session. It is binding, tool-agnostic, and it tells you everything else — including to read every `LEARNINGS-*.md` beside it before you plan. Say which agent and model you are in your first message; if there is no learnings file for your tool yet, you are the first run of your kind and you create one at the end.

If that directory is missing:

```bash
git fetch origin chore/agentic-exercise-delivery-skill
git checkout chore/agentic-exercise-delivery-skill -- .claude
git reset -- .claude
```

## Copy to here

---

## Why it is this short

Everything that used to be pasted every session now lives in `SKILL.md`, so every agent gets it identically and you never re-type it:

| Used to be in the prompt | Now |
|---|---|
| "tell me which agent and model you are" | Phase 0 |
| "read the other agent's learnings" | Phase 0 — globs `LEARNINGS-*.md`, so a brand-new agent is picked up automatically |
| Branch name, base branch | Phase 1 — derived from the exercise directory |
| "brief me before implementing" | Phase 2 |
| Hard rules: protected files, unsatisfiable gates, porcelain, protected-restore, model slug | Non-negotiables 1–10 and Phase 5 |
| "don't open the PR" | Non-negotiable 10 |
| Per-state proof requirements | Phase 2 — derived from the exercise's own brief |
| "write LEARNINGS-<agent>.md" | Phase 8 |

**Adding anything back to the prompt is a signal that `SKILL.md` is missing it.** Fix it there instead — that is what keeps every agent at the same bar.

The one exception: if you have feedback on an agent's *last* run that it could not have learned by itself, add a short "Calibration from your previous run" paragraph. Lead with what it got right, and separate a correct diagnosis from a wrong action — the most common failure so far has not been missing a problem, it has been finding one and shipping anyway. Once a calibration point has held across two runs, promote it into `SKILL.md` and drop it from the prompt.

## Any agent, including one that has never run here

The prompt has no agent name in it, and there is no per-agent variant to maintain. `SKILL.md` opens with a capability contract — read/write files, run shell commands and see exit codes, run `git`, run `npm` — and states what to do when subagents or persistent-rule support are missing (run the review lanes serially and say so). Phase 0 globs `LEARNINGS-*.md`, so a new tool inherits every prior lesson on its first run and creates its own file in Phase 8.

So handing the series to Codex, Aider, Copilot, or anything else takes the same five-line paste. Do not write a variant for it.

What each agent has contributed so far, all of it now binding in `SKILL.md` regardless of which tool picks up next:

| | Strength it established |
|---|---|
| **opencode** | Session hygiene — shared-checkout contamination and the worktree-first fix; cheap unsatisfiability probes before planning; refusing to manufacture a worse baseline; one subject per commit. Plus 9.1's citation discipline: five findings pinned to lines that survive re-derivation against the *authoritative* artifact, not the file it had open. |
| **cursor** | Harness-contract precision — reading the verifier as the spec; telling a benign SHA argument from a self-invalidating cycle; per-state side-effect matrices; `file:line` on every claim including dismissed ones; the model slug. First to ship `evidence/guardrails.md` unprompted, on 8.3. |
| **the recurring failure** | *An unreported check is not evidence.* 8.1, 8.2, and 9.1 each ran both guardrails correctly, reported them in chat, and failed the follow-up audit. Instruction alone did not fix it, which is why the Phase 2 brief must now name `evidence/guardrails.md` by hand and the final report must paste the completed Phase 5 checklist. |

## One branch for everything

`chore/agentic-exercise-delivery-skill` holds `.claude/skills/exercise-delivery/` — `SKILL.md`, `PROMPT.md`, and one `LEARNINGS-<agent>.md` per agent. That is the only branch involved. Agents append to their own learnings file and push it there (Phase 8); files never collide, so parallel sessions just rebase.

Superseded and safe to ignore: `chore/agent-learnings-opencode` and `chore/agent-learnings-cursor`. Their content already lives in the `LEARNINGS-*.md` files.

`.claude/` stays **untracked** in the working tree so it survives branch switches and cannot land in an exercise commit. That also means it does not travel in a fresh `git clone` — when handing the repo to someone else, copy the working directory including `.claude/`, or have them run the three recovery commands above.

## State of play

**Remotes** — `origin` is the personal fork `atul-kumar-prajapati/agentic-engineering-exercises`; `upstream` is the company repo `codewalnut-labs/agentic-engineering-full-exercises-set`. Base work on the latest upstream tip (currently `upstream/main`; `upstream/feature/improve-exercise-challenges` is tree-identical and one minute older).

**Completed and pushed to `origin`** — 1.2, 2.1, 2.2, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 5.1, 5.2, 6.1 (plus three lane branches), 6.2, 6.3, 7.1, 7.2, 7.3 (each + `-before`), 8.1 (opencode, + `-before`), 8.2 (cursor, + `-before` / `-after`), 8.3 (cursor, + `-before` / `-after`), 9.1 (opencode, no companions — 9.1's before/after are the review target's two states, not two agent attempts).

**Queue** — 9.2 (`09 Code Review/exercise-02-diff-triage-with-fresh-agent`), then 9.3, then 10.1 through 12.3 in order. Exercises 1.1 and 5.3 have no branch on `origin` yet; confirm before assuming they are skipped.

**Open exercise defects found in 9.1, worth fixing upstream** — `review-gauntlet-app/semgrep.yml` is invalid YAML (colon+space in the unquoted pattern at line 7) *and* its pattern `<... … ... />` does not parse in semgrep; the working form is `<$EL dangerouslySetInnerHTML={{ __html: $SOURCE }} />`. Separately, the checked-in app is a condensed reformat of the bundle head, so `fixtures/review-expectations.json` pins lines that do not match the file a learner reads (sink at 28 in the app, 31 in the bundle). Both are protected files, so a learner cannot fix either.

**Branch naming** — early branches used inconsistent forms (`codex/exercise1.2-...`, `codex/exercise-02-...`). From 3.2 onward the convention is `codex/exercise-<SS>-<NN>-<slug>`, and 7.1 was renamed to match. Everything new uses that form; `SKILL.md` derives it from the exercise directory.

**Heavy model-run exercises** — 5.3, 9.3, 10.2, 12.3 need dozens of measured runs each. `docs/EXERCISE_SETUP_AND_TIME.md` has the run matrix. Confirm budget before starting those four.

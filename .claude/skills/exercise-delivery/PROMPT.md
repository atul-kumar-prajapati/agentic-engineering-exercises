# Handoff Prompt

Paste the block below into a fresh session opened at the repository root. Change only the exercise named on the first line.

It is written to be **agent-agnostic** — it tells the agent where the conventions live instead of assuming the agent auto-discovers them. It works whether or not the tool supports Claude Code skills.

---

## Copy from here

We are working through the competency exercises in this repository, one exercise per session.

**This session: `07 Docs & Diagrams/exercise-02-codebase-graph-to-diagrams` (7.2).**

**First, before anything else, read this file and follow it as your working instructions for the whole session:**

```
.claude/skills/exercise-delivery/SKILL.md
```

It holds the conventions this series already follows: base-branch selection, branch naming, the order to read the exercise contract in, the specialist-subagent protocol, evidence and hash-binding rules, verification discipline, and the PR-details format. Treat it as binding. Where it conflicts with the exercise's own README or verifier scripts, the exercise wins — the file says so itself.

If that file is missing, recover it before starting:

```bash
git fetch origin chore/agentic-exercise-delivery-skill
git checkout chore/agentic-exercise-delivery-skill -- .claude
git reset -- .claude
```

That leaves it untracked in the working tree, which is where it must stay — see "Keeping this out of the exercise diff" at the end of this prompt.

If your tool supports reusable skills, rules, or persistent instructions, install those conventions as one now so you do not have to re-read the file every session — a Claude Code skill under `.claude/skills/`, an `AGENTS.md` entry, a Cursor rule, or whatever your equivalent is. Keep it outside the exercise directories. If your tool has no such mechanism, just keep the file's rules in context for the session.

Also read `docs/SUBMISSION_STANDARD.md` and `docs/EXERCISE_SETUP_AND_TIME.md`. They are short and they are repo-wide rules.

Before implementing, give me a short brief covering:

1. What this exercise is about and what skill it teaches, in plain language.
2. The required deliverables and the protected files.
3. Any commit-ordering or hash-binding constraint you found by reading the verifier scripts.
4. Your specialist lane plan, with each lane's scope and ownership boundary.

Then work autonomously. Come back to me only if the skill file's escalation rules say a decision is genuinely mine.

Finish with the PR details block. Do not open the PR — I raise it myself.

## Copy to here

---

## State of play

**Remotes** — `origin` is the personal fork `atul-kumar-prajapati/agentic-engineering-exercises`; `upstream` is the company repo `codewalnut-labs/agentic-engineering-full-exercises-set`. Base work on the latest upstream tip (currently `upstream/main`; `upstream/feature/improve-exercise-challenges` is tree-identical and one minute older).

**Completed and pushed to `origin`** — 1.2, 2.1, 2.2, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 5.1, 5.2, 6.1 (plus three lane branches), 6.2, 6.3, 7.1 (plus its `-before` companion).

**Queue** — 7.2, then 7.3, then 8.1 through 12.3 in order. Exercises 1.1 and 5.3 have no branch on `origin` yet; confirm with the user before assuming they are skipped.

**Branch naming** — early branches used inconsistent forms (`codex/exercise1.2-...`, `codex/exercise-02-...`). From 3.2 onward the convention is `codex/exercise-<SS>-<NN>-<slug>`, and 7.1 was renamed to match. Use that form for everything new.

**Exercises with heavy model-run requirements** — 5.3, 9.3, 10.2, 12.3 need dozens of measured runs each. `docs/EXERCISE_SETUP_AND_TIME.md` has the run matrix. Estimate the call count and confirm budget with the user before starting those four.

## Keeping this out of the exercise diff

`.claude/` is not part of any exercise. Every exercise branch must contain only files from its own exercise directory, so **never stage `.claude/`** into an exercise commit — treat it like `.DS_Store`. Keeping it untracked in the working tree is deliberate: it survives branch switches and cannot be committed by accident.

The durable copy is committed on `origin/chore/agentic-exercise-delivery-skill`.

## Handing the repository to someone else

`.claude/` is untracked, so it does **not** travel in a fresh `git clone`. When handing off:

- Copy the actual working directory, `.claude/` included, **or**
- Have the receiver run the three recovery commands in the prompt block above.

Then paste the prompt block. The prompt names the file path, so any agent that can read a file can find the conventions — no skill auto-discovery required.

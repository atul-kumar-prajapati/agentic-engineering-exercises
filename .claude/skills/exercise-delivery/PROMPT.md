# Handoff Prompt

Paste the block below into a fresh session opened at the repository root. Change only the exercise on the first line.

---

## Copy from here

We are working through the competency exercises in this repository, one exercise per session.

**This session: `07 Docs & Diagrams/exercise-02-codebase-graph-to-diagrams` (7.2).**

Use the `exercise-delivery` skill and follow it end to end. It holds the conventions, the branch-naming rule, the base-branch selection, the specialist-subagent protocol, the evidence requirements, the verification discipline, and the PR-details format. Do not restate the skill back to me — just apply it.

Before implementing, give me a short brief covering:

1. What this exercise is about and what skill it teaches, in plain language.
2. The required deliverables and the protected files.
3. Any commit-ordering or hash-binding constraint you found by reading the verifier scripts.
4. Your specialist lane plan, with each lane's scope and ownership boundary.

Then work autonomously. Come back to me only if the skill's escalation rules say a decision is genuinely mine.

Finish with the PR details block. Do not open the PR — I raise it myself.

## Copy to here

---

## State of play

**Remotes** — `origin` is the personal fork `atul-kumar-prajapati/agentic-engineering-exercises`; `upstream` is the company repo `codewalnut-labs/agentic-engineering-full-exercises-set`. Base work on the latest upstream tip (currently `upstream/main`; `upstream/feature/improve-exercise-challenges` is tree-identical and one minute older).

**Completed and pushed to `origin`** — 1.2, 2.1, 2.2, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 5.1, 5.2, 6.1 (plus three lane branches), 6.2, 6.3, 7.1 (plus its `-before` companion).

**Queue** — 7.2, then 7.3, then 8.1 through 12.3 in order. Exercises 1.1 and 5.3 have no branch on `origin` yet; confirm with the user before assuming they are skipped.

**Branch naming** — early branches used inconsistent forms (`codex/exercise1.2-...`, `codex/exercise-02-...`). From 3.2 onward the convention is `codex/exercise-<SS>-<NN>-<slug>`, and 7.1 was renamed to match. Use that form for everything new.

**Exercises with heavy model-run requirements** — 5.3, 9.3, 10.2, 12.3 need dozens of measured runs each. `docs/EXERCISE_SETUP_AND_TIME.md` has the run matrix. Estimate the call count and confirm budget with the user before starting those four.

## Keeping this skill out of the exercise diff

`.claude/` is not part of any exercise. Every exercise branch must contain only files from its own exercise directory, so **never stage `.claude/`** into an exercise commit — treat it like `.DS_Store`. It lives in the working tree and survives branch switches.

A committed copy is on `origin/chore/agentic-exercise-delivery-skill` if the working-tree copy is ever lost.

# Exercise 01: Release Notes Agent Skill Factory

## Objective

Create a reusable release-notes skill that derives customer-facing notes from a real Git comparison and partial evidence.

## Starting Point

`fixtures/release-history.bundle` contains real base and head refs with messy commits, a breaking API rename, and an internal-only telemetry change. PR context and CI evidence are separate inputs.

## Required Implementation Changes

- Clone the bundle and inspect `exercise-base..origin/exercise-head`.
- Create the skill at `release-notes-app/.agents/skills/release-notes/SKILL.md`.
- Define inputs, publication rules, output format, trigger cases, and non-trigger cases.
- Generate notes that trace entries to a changed file or commit.
- Flag the breaking change and missing migration evidence; exclude internal-only telemetry work.
- Put publishable entries under `## Customer-facing changes`. Give every `###` entry a `- Trace:` line containing a real changed path or commit SHA.

## Allowed Changes

Change the skill package, release-note generation or verification scripts, tests, and `evidence/**`. Do not edit the bundle, PR context, or CI evidence to match generated output.

## Required Commands

Use the supported versions and clean-install sequence in [the submission standard](../../docs/SUBMISSION_STANDARD.md).

From `release-notes-app`:

```text
npm ci
npm run fixture:smoke
npm run release:verify -- <cloned-fixture-path> <release-notes.md>
npm run agent:check
```

Clone with `git clone ../fixtures/release-history.bundle <path>`, then compare `exercise-base..origin/exercise-head`.

## Acceptance Criteria

- The verifier reads changed files and commits from Git.
- Every published item has a real trace.
- Breaking and missing-evidence statements are explicit.
- Internal-only changes are omitted.
- Positive and negative skill-trigger cases are demonstrated.

## Evidence Contract

Commit the skill, generated notes, trigger results, and `evidence/release-note-verification.md` with the comparison range, command output, traces, rollout implications, and rollback note.

## Incomplete When

Expected notes are copied into provider logic, the Git bundle is not inspected, internal work is published, missing evidence is treated as passing, or trigger behavior is untested.

## Evaluation Rubric

See [Release Notes Skill Factory](../../docs/EVALUATION_RUBRICS.md#release-notes-skill-factory).

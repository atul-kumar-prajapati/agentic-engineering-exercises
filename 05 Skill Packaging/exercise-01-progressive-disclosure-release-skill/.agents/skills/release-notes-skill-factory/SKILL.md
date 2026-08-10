---
name: release-notes-skill-factory
description: Use when practicing the Release Notes Skill Factory workflow for Product release dashboard.
---

# Release Notes Skill Factory

## Use When

- Turning commits, PR summaries, and evidence notes into customer-facing release notes.
- The task asks to group changes by customer impact, flag missing evidence, or identify breaking changes.
- A team needs repeatable release-note output from the same source data.

## Do Not Use When

- The learner has not yet read the exercise README.
- The task is a code review, migration, or implementation task with no release communication output.
- The requested output is outside this exercise folder.

## Workflow

1. Read `references/release-note-taxonomy.md`.
2. Parse commit and PR fixtures before summarizing.
3. Group changes into Added, Changed, Fixed, Deprecated, Removed, Security, and Internal.
4. Mark customer-facing impact, breaking changes, rollout flags, missing evidence, and owner.
5. Exclude purely internal refactors unless they affect customers or operations.
6. Run trigger evals and update examples when the skill over-includes or misses risk.

## Output Contract

- One concise release note per customer-facing change.
- Evidence link or command for each item.
- Explicit breaking-change and rollback notes.
- Missing-evidence section for changes that should not ship yet.

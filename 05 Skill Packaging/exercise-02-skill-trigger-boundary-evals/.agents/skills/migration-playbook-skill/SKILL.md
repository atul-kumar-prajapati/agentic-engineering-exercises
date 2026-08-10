---
name: migration-playbook-skill
description: Use when practicing the Migration Playbook Skill workflow for Legacy support case console.
---

# Migration Playbook Skill

## Use When

- Migrating legacy React components to typed, tested modules.
- The task needs phases, stop conditions, behavior preservation, and review notes.
- A migration must avoid shared foundations unless explicitly approved.

## Do Not Use When

- The learner has not yet read the exercise README.
- The task is a greenfield component or simple copy edit.
- The requested output is outside this exercise folder.

## Workflow

1. Read `references/migration-phases.md`.
2. Identify the component boundary, public props, keyboard behavior, visual states, and tests before editing.
3. Add characterization tests for current behavior.
4. Migrate one component at a time; stop before shared foundation edits unless the exercise explicitly grants ownership.
5. Run typecheck, tests, and review notes after each phase.
6. Update eval cases when the skill triggers too broadly or misses behavior preservation.

## Output Contract

- Component boundary and owner.
- Preserved behaviors and intentional changes.
- Tests added before and after migration.
- Stop condition reached or next safe slice.

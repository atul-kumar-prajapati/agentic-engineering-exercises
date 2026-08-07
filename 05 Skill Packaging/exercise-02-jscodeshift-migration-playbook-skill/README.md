# Exercise 02: jscodeshift Migration Playbook Skill

## Objective

Package a bounded migration skill and transform the supplied class-based `LegacyAction` component without changing stateful or already-modern components.

## Starting Point

The app includes the genuine legacy component, input and expected fixtures, a stateful stop fixture, an unrelated modern component, and an identity transform that intentionally fails the migration verifier.

## Required Implementation Changes

- Implement `transform/legacy-action.cjs` with jscodeshift.
- Create the migration skill at `migration-playbook-app/.agents/skills/jscodeshift-migration/SKILL.md`.
- Preserve click, Enter, Space, label, class, and button type behavior.
- Stop on stateful class components and leave unrelated modern components unchanged.
- Document dry run, batch boundary, rollback, and when not to use the skill.

## Allowed Changes

Change the transform, target legacy component, skill, migration tests, and evidence. Do not edit expected, stop, or unchanged fixtures merely to make verification pass.

## Required Commands

Use the supported versions and clean-install sequence in [the submission standard](../../docs/SUBMISSION_STANDARD.md).

From `migration-playbook-app`:

```text
npm ci
npm run test:starter
npm run test:migration
npm run agent:check
```

Also include the jscodeshift dry-run command in evidence.

## Acceptance Criteria

- The real legacy pattern matches the expected output.
- A second transform run is identical.
- The stateful stop fixture and modern component do not change.
- Behavior invariants have focused tests.
- Rollback and batch stop conditions are usable.

## Evidence Contract

Commit the skill, transform, migrated slice, behavior tests, dry-run output, and `evidence/migration.md` containing idempotence and unrelated-file proof.

## Incomplete When

The component receives only cosmetic edits, expected fixtures are altered to match a weak transform, keyboard behavior is lost, a second run changes code, or stop cases transform.

## Evaluation Rubric

See [jscodeshift Migration Playbook](../../docs/EVALUATION_RUBRICS.md#jscodeshift-migration-playbook).

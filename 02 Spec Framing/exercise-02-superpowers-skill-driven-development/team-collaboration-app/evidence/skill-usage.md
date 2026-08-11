# Superpowers Skill Usage

- Superpowers version or commit: `44c9b2d6e889982ac18c27d05a19fefe335194e1` from `obra/superpowers` main, installed repository-locally on 2026-08-11
- Design artifact: `docs/superpowers/specs/2026-08-11-team-invitations-design.md`
- Plan artifact: `docs/superpowers/plans/2026-08-11-team-invitations.md`
- Design approval: The user approved the pure immutable service architecture, complete create/accept/revoke lifecycle, deterministic rejection behavior, and backend-focused thin UI before planning began.

## Invoked skills in workflow order

1. `superpowers:using-superpowers` — established mandatory skill discovery and sequencing; loaded its Codex platform guidance.
2. `superpowers:brainstorming` — inspected the application, contract, incidents, tests, and submission rules; compared three approaches; produced the approved design and commit `f51536d`.
3. `superpowers:writing-plans` — converted the design into executable test-first tasks; produced the implementation plan and commit `9eb59af`.
4. `superpowers:executing-plans` — selected inline execution because the user requested uninterrupted completion; executed the committed plan through checkpoints.
5. `superpowers:test-driven-development` — added contract coverage, recorded the failing unimplemented-service result, implemented the lifecycle, and recorded the passing result in `evidence/tdd.md`.
6. `superpowers:systematic-debugging` — traced Node ESM resolution and TypeScript import compatibility failures to their root cause; verified the focused runner, compiler settings, and minimal fix.
7. `superpowers:requesting-code-review` — dispatched an independent read-only reviewer over the implementation commit range; findings are recorded in `evidence/review.md`.
8. `superpowers:receiving-code-review` — verified each external finding, resolved the applicable test and UI issues, and declined an optional dependency-expanding UI test with technical rationale.
9. `superpowers:verification-before-completion` — ran fresh invitation, submission, and full agent checks before completion; results are recorded in `evidence/after.md`.

## Repository-local installation

The skill-installer downloaded the Superpowers skills into `.codex/skills/`. The installed files are repository-local rather than part of the global Codex user profile.

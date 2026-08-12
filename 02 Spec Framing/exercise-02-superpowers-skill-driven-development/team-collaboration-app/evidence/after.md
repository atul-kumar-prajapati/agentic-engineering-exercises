# Superpowers-Driven Session

- Agent: Codex
- Model: GPT-5
- Tools: PowerShell shell, apply_patch, Git, and Codex reviewer subagent
- Permissions: Managed workspace-write permissions with approved Git metadata and network escalation
- Time limit: 60 minutes
- Attempt: 1
- Prompt: Add a Team Invitations section. An active owner or admin allowed by the workspace policy may invite an email as a member or guest. Guest invitations are allowed only when the workspace policy permits them. Prevent invitations for existing members or an email with a pending invitation. Invitations must use the configured expiry period and may be accepted or revoked only once. Rejected actions must not change invitation or member data.

## Investigation

The session inspected the invitation contract, supplied tests, workspace policy helper, team seed data, unsafe legacy prototype, support incidents, submission verifier, integrity manifest, package scripts, application structure, and recent Git history before implementation.

## Design and planning

`superpowers:brainstorming` compared pure functions, a reducer, and domain classes. The user approved pure immutable transitions and a backend-focused thin UI before the design was written and committed. `superpowers:writing-plans` then produced the task-level implementation plan before tests or production changes.

## Test-driven implementation

`superpowers:test-driven-development` recorded the failing invitation command before production code in `evidence/tdd.md`. The service was then implemented with normalized email handling, workspace authorization, guest policy, duplicate protection, configured expiry, immutable single-use acceptance and revocation, and original-state rejection. The focused suite turned green before UI work.

`superpowers:executing-plans` drove inline implementation checkpoints. The React Team Invitations section delegates all lifecycle decisions to the shared service and updates in-memory state only after successful results.

## Review

`superpowers:requesting-code-review` dispatched an independent reviewer. `superpowers:receiving-code-review` validated the findings, added supplemental coverage for state identity, policy exclusion, guest role preservation, and accepted-invitation revocation, and aligned the permission display with current state policy. The review record is in `evidence/review.md`.

## Final verification

Commands were executed through `npm.cmd` on Windows; the canonical npm commands are recorded below.

### `npm run test:invitations`

- Result: exit code 0
- Summary: 16 tests, 16 passed, 0 failed

```text
✔ authorized creation normalizes email and uses the configured expiry
✔ an active admin listed in inviteRoles may create an invitation
✔ members and suspended actors cannot create invitations
✔ target roles and the guest policy are enforced
✔ invalid email addresses are rejected without mutation
✔ existing member email comparison is case-insensitive
✔ an unexpired pending invitation blocks a case-insensitive duplicate
✔ an expired pending invitation does not block a replacement
✔ duplicate invitation identifiers are rejected
✔ accepting a pending invitation adds one member and finalizes the invitation
✔ expired invitations cannot be accepted
✔ accepted and revoked invitations cannot be accepted
✔ acceptance rejects a duplicate member identifier
✔ an authorized actor may revoke a pending invitation only once
✔ unauthorized actors and expired invitations cannot be revoked
✔ unknown invitation identifiers are rejected
ℹ tests 16
ℹ pass 16
ℹ fail 0
```

### Supplemental invitation tests

- Command: `node --experimental-strip-types --test ./tests/invitationService.additional.test.ts`
- Result: exit code 0
- Summary: 3 tests, 3 passed, 0 failed

### `npm run agent:check`

- Result: exit code 0
- Summary: lint, protected-file integrity, format, typecheck, and production build all passed.

```text
lint-check passed
agent-check passed for Superpowers Skill-Driven Development; protected challenge files are unchanged.
format-check passed
vite v7.3.6 building client environment for production...
32 modules transformed.
✓ built in 1.48s
```

### `npm run submission:verify`

- Result: exit code 0
- Requirement connection: the recovered genuine before-run evidence and the Superpowers after-run artifacts satisfy the submission evidence checks.

```text
> team-collaboration-app@0.1.0 submission:verify
> node ./scripts/verify-submission.mjs

Submission verification passed: Superpowers workflow evidence, artifacts, implementation wiring, and challenge integrity are complete.
```

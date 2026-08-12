# Session Without Superpowers

- Agent: Codex
- Model: GPT-5
- Tools: PowerShell shell, apply_patch, Git, and Codex reviewer subagent
- Permissions: Managed workspace-write permissions with approved Git metadata and network escalation
- Time limit: 60 minutes
- Attempt: 1
- Prompt: Add a Team Invitations section. An active owner or admin allowed by the workspace policy may invite an email as a member or guest. Guest invitations are allowed only when the workspace policy permits them. Prevent invitations for existing members or an email with a pending invitation. Invitations must use the configured expiry period and may be accepted or revoked only once. Rejected actions must not change invitation or member data.

## Session status

Superpowers was disabled for this run. The implementation was preserved as the uncommitted working-tree diff on branch `codex/exercise-02-02-without-superpowers`, based directly on starter commit `de46ede`. The genuine patch is linked at `evidence/before.patch`.

## Investigation

The retained implementation shows that the agent used the supplied invitation types and workspace policy model. No separate investigation notes or transcript artifact were saved, so this evidence does not claim file-reading steps that cannot be independently observed.

## Design

No approved design artifact was produced before implementation. Architectural decisions are visible only in the resulting code: lifecycle rules were placed in `src/services/invitationService.ts`, while React kept in-memory state and invoked creation and revocation actions.

## Planning

No written implementation plan or planning checkpoint was produced. The three modified files appeared together as one uncommitted implementation diff.

## Testing

No recorded failing test exists before production code, and the supplied automated tests were not modified. After the implementation had already been written, the preserved state was verified on 2026-08-12:

- `npm run test:invitations`: exit code 0; 16 tests passed and 0 failed.
- `npm run agent:check`: exit code 0; lint, protected-file integrity, formatting, typecheck, and production build passed.

This is verification-after-implementation, not evidence of test-driven development.

## Implementation

The run implemented all three service exports and a visible Team Invitations section:

- Creation checks active policy-authorized actors, target role, guest policy, normalized email validity, duplicate invitation IDs, existing member email, and unexpired pending invitations.
- Acceptance checks missing, final, and expired invitations plus duplicate member IDs; it also rejects an invitation email that has become an existing member.
- Revocation checks authorization and permits only pending, unexpired invitations.
- Rejections return the input state, while successful transitions create replacement arrays and records.
- The UI creates and revokes invitations using a fixed owner actor. It does not expose invitation acceptance or actor selection.

## Review

No independent code-review artifact or review-resolution loop was produced during the run. Later comparison may inspect the preserved patch, but that later analysis must not be represented as review performed by the original session.

## Verification output

### `npm run test:invitations`

```text
tests 16
suites 0
pass 16
fail 0
cancelled 0
skipped 0
pending tests 0
```

### `npm run agent:check`

```text
lint-check passed
agent-check passed for Superpowers Skill-Driven Development; protected challenge files are unchanged.
format-check passed
tsc -b --pretty false
32 modules transformed.
built successfully in 1.14s
```

## Observable limitations

- No approved design preceded coding.
- No written plan connected requirements to implementation steps.
- No failing test was recorded before production code.
- No original-session code review was recorded.
- The UI does not expose acceptance even though the service implements it.
- The UI fixes the actor to `USR-201`, so authorization rejection cannot be exercised from the visible interface.

# Team Invitations TDD Evidence

## Red

- Date: 2026-08-11T16:28:02+05:30
- Command: `npm.cmd run test:invitations`
- Working directory: `team-collaboration-app`
- Result: exit code 1
- Requirement connection: the focused contract suite failed before production implementation because the three invitation lifecycle functions were still unimplemented.

```text
> team-collaboration-app@0.1.0 test:invitations
> node ./scripts/run-invitation-tests.mjs

Invitation tests failed: implement createInvitation, acceptInvitation, and revokeInvitation in src/services/invitationService.ts.
```

## Green

- Date: 2026-08-11T16:31:57+05:30
- Command: `npm.cmd run test:invitations`
- Working directory: `team-collaboration-app`
- Result: exit code 0
- Requirement connection: the immutable lifecycle implementation passes the focused invitation contract suite.

```text
> team-collaboration-app@0.1.0 test:invitations
> node ./scripts/run-invitation-tests.mjs

✔ authorized creation normalizes email and uses the configured expiry (22.3822ms)
✔ an active admin listed in inviteRoles may create an invitation (0.6486ms)
✔ an otherwise active admin excluded by inviteRoles cannot create or revoke (6.076ms)
✔ members and suspended actors cannot create invitations (0.68ms)
✔ target roles and the guest policy are enforced (0.7774ms)
✔ invalid email addresses are rejected without mutation (0.9339ms)
✔ existing member email comparison is case-insensitive (0.6191ms)
✔ an unexpired pending invitation blocks a case-insensitive duplicate (0.6514ms)
✔ an expired pending invitation does not block a replacement (0.6335ms)
✔ duplicate invitation identifiers are rejected (0.9116ms)
✔ accepting a pending invitation adds one member and finalizes the invitation (1.2766ms)
✔ accepting a guest invitation creates an active guest (0.6042ms)
✔ expired invitations cannot be accepted (0.3462ms)
✔ accepted and revoked invitations cannot be accepted (1.0328ms)
✔ acceptance rejects a duplicate member identifier (0.5639ms)
✔ an authorized actor may revoke a pending invitation only once (0.8139ms)
✔ unauthorized actors and expired invitations cannot be revoked (1.1433ms)
✔ unknown invitation identifiers are rejected (1.2773ms)
ℹ tests 18
ℹ suites 0
ℹ pass 18
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 864.79
```

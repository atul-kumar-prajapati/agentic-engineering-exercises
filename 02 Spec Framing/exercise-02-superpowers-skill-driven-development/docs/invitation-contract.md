# Invitation Implementation Contract

The executable tests import `src/services/invitationService.ts`. Implement and export:

- `createInvitation(state, input)`
- `acceptInvitation(state, input)`
- `revokeInvitation(state, input)`

Use the invitation types supplied in `src/types.ts`.

## Create

The input contains `invitationId`, `actorId`, `email`, `role`, and an ISO `now` value.

- Only an active actor included in `WorkspacePolicy.inviteRoles` may create an invitation.
- Only `member` and `guest` are valid target roles. Guest requires `allowGuestInvites`.
- Trim and lowercase email addresses before comparison and storage.
- Reject an existing member, an unexpired pending invitation, an invalid email, or a duplicate invitation ID.
- Set expiry from `defaultInviteExpiryDays`.

## Accept

The input contains `invitationId`, `memberId`, and an ISO `now` value.

- Only a pending, unexpired invitation may be accepted.
- Mark it accepted and add one active member using the normalized email and invited role.
- Reject a duplicate member ID and every repeated, revoked, or expired acceptance.

## Revoke

The input contains `invitationId`, `actorId`, and an ISO `now` value.

- Apply the same actor authorization used for creation.
- Only a pending, unexpired invitation may be revoked.
- A revoked invitation cannot later be accepted or revoked again.

Every function returns an `InvitationActionResult` and must not mutate its input state. A rejected action must return the original state unchanged by value. Do not import or reuse `src/legacy/quickInvite.ts`.

The application must include a visible `Team Invitations` section that uses this service rather than implementing a second copy of the lifecycle rules.

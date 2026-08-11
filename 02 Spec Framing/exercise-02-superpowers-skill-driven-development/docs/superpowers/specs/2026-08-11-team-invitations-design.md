# Team Invitations Design

## Goal

Add a backend-focused invitation lifecycle and a visible, minimal Team Invitations section. The lifecycle must enforce workspace authorization and guest policy, prevent case-insensitive duplicates, calculate configured expiry, permit acceptance or revocation only once, and leave state unchanged after every rejected action.

## Scope

The implementation uses the existing TypeScript types and in-memory React application. It does not add a backend server, persistence, email delivery, authentication, or new invitation roles. The unsafe legacy `quickInvite` helper remains unused.

## Architecture

`src/services/invitationService.ts` is the single source of truth for invitation rules. It exports the contract functions `createInvitation`, `acceptInvitation`, and `revokeInvitation`. Each function is a pure state transition: it validates the complete request before constructing changed data, returns a new state on success, and returns the original state on rejection.

Small private helpers provide email normalization and validation, actor authorization through the existing `canManageInvitations` policy function, invitation lookup, and expiry checks. The React UI stores the current `InvitationState` in memory and delegates all lifecycle actions to the service instead of duplicating business rules.

## Creation Flow

Creation receives an invitation ID, actor ID, email, target role, and ISO timestamp.

1. Find the actor and require that the actor is active and has a role included in `WorkspacePolicy.inviteRoles`.
2. Allow only `member` or `guest`; require `allowGuestInvites` for guests.
3. Trim and lowercase the email, then reject invalid email syntax.
4. Reject an invitation ID already present in the state.
5. Reject a case-insensitive email match with an existing member.
6. Reject a case-insensitive match with an unexpired pending invitation. Expired, accepted, and revoked invitations do not block a replacement.
7. Set `createdAt` to the supplied `now` value and calculate `expiresAt` by adding `defaultInviteExpiryDays` in UTC milliseconds.
8. Append one pending invitation to a new invitations array.

## Acceptance Flow

Acceptance receives an invitation ID, member ID, and ISO timestamp.

1. Reject an unknown invitation.
2. Require pending status; accepted and revoked invitations are final.
3. Treat an invitation as expired when `expiresAt` is equal to or earlier than `now`.
4. Reject a member ID already present in the state.
5. Replace the invitation with an accepted copy and append exactly one active member using the invitation's normalized email and invited role. The generated display name is the normalized email, and `lastActiveDays` starts at zero.

## Revocation Flow

Revocation receives an invitation ID, actor ID, and ISO timestamp.

1. Apply the same actor authorization used for creation.
2. Reject an unknown invitation.
3. Require pending status and reject accepted or revoked invitations as final.
4. Treat an invitation as expired when `expiresAt` is equal to or earlier than `now`.
5. Replace the invitation with a revoked copy without changing members.

## Rejection and Immutability

Each failure returns `{ ok: false, code, state }`, where `state` is the original input object. No validation path pushes, splices, rewrites, or otherwise mutates members, invitations, policy, or nested records. Successful paths create new arrays and copy only records whose values change.

Validation order is deterministic:

- Creation: authorization, role, guest policy, email, invitation ID, existing member, pending invitation.
- Acceptance: invitation existence, final status, expiry, duplicate member ID.
- Revocation: authorization, invitation existence, final status, expiry.

## User Interface

The existing member console gains a visible `Team Invitations` section. It provides an actor selector, email field, member/guest role selector, and invite action. A list shows invitation email, role, status, and expiry with accept and revoke controls when applicable. Member IDs for UI acceptance are generated locally. The UI reports service error codes and does not update React state after rejection.

The UI is deliberately minimal because lifecycle correctness is the exercise focus. It uses only the service exports and contains no parallel authorization, duplicate, policy, or expiry logic.

## Testing

Automated service tests cover:

- active owner and admin authorization;
- rejection of members, guests, suspended actors, and actors excluded by policy;
- member/guest role validation and guest-policy enforcement;
- email normalization and invalid email rejection;
- case-insensitive existing-member and pending-invitation prevention;
- replacement after pending invitation expiry;
- duplicate invitation and member identifiers;
- configured expiry calculation;
- acceptance and revocation success;
- equality-at-expiry rejection;
- repeated, accepted, revoked, expired, and missing invitation actions;
- preservation of input state on success and rejection.

Test-driven implementation records a failing invitation test run before production changes and a passing run afterward. Final verification runs `npm run test:invitations`, `npm run submission:verify`, and `npm run agent:check`.

## Success Criteria

The contract functions pass all supplied and added invitation tests. The visible section exercises the service lifecycle. Required workflow evidence records design approval, the implementation plan, red/green test outputs, review findings, and final verification without fabricating a pre-Superpowers session.

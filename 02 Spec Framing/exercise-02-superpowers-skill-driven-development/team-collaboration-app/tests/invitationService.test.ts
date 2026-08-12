import assert from "node:assert/strict";
import { test } from "node:test";

import { members, workspacePolicy } from "../src/data/team.ts";
import { acceptInvitation, createInvitation, revokeInvitation } from "../src/services/invitationService.ts";
import type { InvitationActionResult, InvitationState, TeamInvitation } from "../src/types.ts";

const NOW = "2026-08-09T10:00:00.000Z";

function makeInvitation(overrides: Partial<TeamInvitation> = {}): TeamInvitation {
  return {
    id: "INV-401",
    email: "new.person@example.test",
    role: "member",
    invitedBy: "USR-201",
    createdAt: "2026-08-08T10:00:00.000Z",
    expiresAt: "2026-08-15T10:00:00.000Z",
    status: "pending",
    ...overrides
  };
}

function makeState(invitations: TeamInvitation[] = []): InvitationState {
  return structuredClone({ members, invitations, policy: workspacePolicy });
}

function createInput(overrides: Record<string, unknown> = {}) {
  return {
    invitationId: "INV-500",
    actorId: "USR-201",
    email: "new.person@example.test",
    role: "member" as const,
    now: NOW,
    ...overrides
  };
}

function expectRejected(result: InvitationActionResult, code: string, original: InvitationState) {
  assert.equal(result.ok, false);
  assert.equal(result.code, code);
  assert.deepEqual(result.state, original, "a rejected action must not mutate state");
}

test("authorized creation normalizes email and uses the configured expiry", () => {
  const state = makeState();
  const snapshot = structuredClone(state);
  const result = createInvitation(state, createInput({ email: "  NEW.Person@Example.Test  " }));

  assert.equal(result.ok, true);
  assert.deepEqual(state, snapshot, "creation must not mutate its input state");
  assert.equal(result.state.invitations.length, 1);
  assert.equal(result.invitation?.email, "new.person@example.test");
  assert.equal(result.invitation?.invitedBy, "USR-201");
  assert.equal(result.invitation?.expiresAt, "2026-08-16T10:00:00.000Z");
  assert.equal(result.invitation?.status, "pending");
});

test("an active admin listed in inviteRoles may create an invitation", () => {
  const result = createInvitation(makeState(), createInput({ actorId: "USR-228" }));
  assert.equal(result.ok, true);
});

test("members and suspended actors cannot create invitations", () => {
  const memberState = makeState();
  expectRejected(createInvitation(memberState, createInput({ actorId: "USR-244" })), "UNAUTHORIZED", memberState);

  const suspendedState = makeState();
  suspendedState.members[0].status = "suspended";
  const snapshot = structuredClone(suspendedState);
  expectRejected(createInvitation(suspendedState, createInput()), "UNAUTHORIZED", snapshot);
});

test("target roles and the guest policy are enforced", () => {
  const guestState = makeState();
  expectRejected(createInvitation(guestState, createInput({ role: "guest" })), "GUEST_DISABLED", guestState);

  const invalidRoleState = makeState();
  expectRejected(
    createInvitation(invalidRoleState, createInput({ role: "owner" }) as never),
    "INVALID_ROLE",
    invalidRoleState
  );

  const guestAllowedState = makeState();
  guestAllowedState.policy.allowGuestInvites = true;
  assert.equal(createInvitation(guestAllowedState, createInput({ role: "guest" })).ok, true);
});

test("invalid email addresses are rejected without mutation", () => {
  for (const email of ["", "not-an-email", "two@@example.test"]) {
    const state = makeState();
    expectRejected(createInvitation(state, createInput({ email })), "INVALID_EMAIL", state);
  }
});

test("existing member email comparison is case-insensitive", () => {
  const state = makeState();
  expectRejected(createInvitation(state, createInput({ email: " IRIS@EXAMPLE.TEST " })), "MEMBER_EXISTS", state);
});

test("an unexpired pending invitation blocks a case-insensitive duplicate", () => {
  const state = makeState([makeInvitation({ email: "Pending@Example.Test" })]);
  expectRejected(
    createInvitation(state, createInput({ email: " pending@example.test " })),
    "INVITATION_PENDING",
    state
  );
});

test("an expired pending invitation does not block a replacement", () => {
  const state = makeState([makeInvitation({ expiresAt: "2026-08-09T09:59:59.000Z" })]);
  const result = createInvitation(state, createInput({ email: "new.person@example.test" }));
  assert.equal(result.ok, true);
  assert.equal(result.state.invitations.length, 2);
});

test("duplicate invitation identifiers are rejected", () => {
  const state = makeState([makeInvitation({ id: "INV-500", email: "other@example.test" })]);
  expectRejected(createInvitation(state, createInput()), "DUPLICATE_INVITATION_ID", state);
});

test("accepting a pending invitation adds one member and finalizes the invitation", () => {
  const state = makeState([makeInvitation()]);
  const snapshot = structuredClone(state);
  const result = acceptInvitation(state, { invitationId: "INV-401", memberId: "USR-500", now: NOW });

  assert.equal(result.ok, true);
  assert.deepEqual(state, snapshot, "acceptance must not mutate its input state");
  assert.equal(result.state.members.length, state.members.length + 1);
  assert.deepEqual(
    result.state.members.at(-1),
    {
      id: "USR-500",
      name: "new.person@example.test",
      email: "new.person@example.test",
      role: "member",
      status: "active",
      lastActiveDays: 0
    }
  );
  assert.equal(result.invitation?.status, "accepted");
});

test("expired invitations cannot be accepted", () => {
  const state = makeState([makeInvitation({ expiresAt: NOW })]);
  expectRejected(
    acceptInvitation(state, { invitationId: "INV-401", memberId: "USR-500", now: NOW }),
    "INVITATION_EXPIRED",
    state
  );
});

test("accepted and revoked invitations cannot be accepted", () => {
  for (const status of ["accepted", "revoked"] as const) {
    const state = makeState([makeInvitation({ status })]);
    expectRejected(
      acceptInvitation(state, { invitationId: "INV-401", memberId: "USR-500", now: NOW }),
      "INVITATION_FINAL",
      state
    );
  }
});

test("acceptance rejects a duplicate member identifier", () => {
  const state = makeState([makeInvitation()]);
  expectRejected(
    acceptInvitation(state, { invitationId: "INV-401", memberId: "USR-201", now: NOW }),
    "DUPLICATE_MEMBER_ID",
    state
  );
});

test("an authorized actor may revoke a pending invitation only once", () => {
  const state = makeState([makeInvitation()]);
  const snapshot = structuredClone(state);
  const revoked = revokeInvitation(state, { invitationId: "INV-401", actorId: "USR-228", now: NOW });

  assert.equal(revoked.ok, true);
  assert.deepEqual(state, snapshot, "revocation must not mutate its input state");
  assert.equal(revoked.invitation?.status, "revoked");

  expectRejected(
    revokeInvitation(revoked.state, { invitationId: "INV-401", actorId: "USR-228", now: NOW }),
    "INVITATION_FINAL",
    revoked.state
  );
  expectRejected(
    acceptInvitation(revoked.state, { invitationId: "INV-401", memberId: "USR-500", now: NOW }),
    "INVITATION_FINAL",
    revoked.state
  );
});

test("unauthorized actors and expired invitations cannot be revoked", () => {
  const unauthorizedState = makeState([makeInvitation()]);
  expectRejected(
    revokeInvitation(unauthorizedState, { invitationId: "INV-401", actorId: "USR-244", now: NOW }),
    "UNAUTHORIZED",
    unauthorizedState
  );

  const expiredState = makeState([makeInvitation({ expiresAt: NOW })]);
  expectRejected(
    revokeInvitation(expiredState, { invitationId: "INV-401", actorId: "USR-201", now: NOW }),
    "INVITATION_EXPIRED",
    expiredState
  );
});

test("unknown invitation identifiers are rejected", () => {
  const acceptState = makeState();
  expectRejected(
    acceptInvitation(acceptState, { invitationId: "INV-404", memberId: "USR-500", now: NOW }),
    "INVITATION_NOT_FOUND",
    acceptState
  );

  const revokeState = makeState();
  expectRejected(
    revokeInvitation(revokeState, { invitationId: "INV-404", actorId: "USR-201", now: NOW }),
    "INVITATION_NOT_FOUND",
    revokeState
  );
});

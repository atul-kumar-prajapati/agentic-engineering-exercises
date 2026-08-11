import assert from "node:assert/strict";
import { test } from "node:test";

import { members, workspacePolicy } from "../src/data/team.ts";
import { acceptInvitation, createInvitation, revokeInvitation } from "../src/services/invitationService.ts";
import type { InvitationState, TeamInvitation } from "../src/types.ts";

const NOW = "2026-08-09T10:00:00.000Z";

function invitation(overrides: Partial<TeamInvitation> = {}): TeamInvitation {
  return {
    id: "INV-401",
    email: "guest@example.test",
    role: "guest",
    invitedBy: "USR-201",
    createdAt: "2026-08-08T10:00:00.000Z",
    expiresAt: "2026-08-15T10:00:00.000Z",
    status: "pending",
    ...overrides
  };
}

function state(invitations: TeamInvitation[] = []): InvitationState {
  return structuredClone({ members, invitations, policy: workspacePolicy });
}

test("rejections return the original state object when an admin is excluded by policy", () => {
  const original = state([invitation()]);
  original.policy.inviteRoles = ["owner"];

  const createResult = createInvitation(original, {
    invitationId: "INV-500",
    actorId: "USR-228",
    email: "new@example.test",
    role: "member",
    now: NOW
  });
  const revokeResult = revokeInvitation(original, {
    invitationId: "INV-401",
    actorId: "USR-228",
    now: NOW
  });

  assert.equal(createResult.ok, false);
  assert.equal(createResult.code, "UNAUTHORIZED");
  assert.equal(createResult.state, original);
  assert.equal(revokeResult.ok, false);
  assert.equal(revokeResult.code, "UNAUTHORIZED");
  assert.equal(revokeResult.state, original);
});

test("acceptance preserves the invited guest role", () => {
  const result = acceptInvitation(state([invitation()]), {
    invitationId: "INV-401",
    memberId: "USR-500",
    now: NOW
  });

  assert.equal(result.ok, true);
  assert.equal(result.state.members.at(-1)?.role, "guest");
  assert.equal(result.state.members.at(-1)?.status, "active");
});

test("an accepted invitation cannot be revoked", () => {
  const original = state([invitation({ status: "accepted" })]);
  const result = revokeInvitation(original, {
    invitationId: "INV-401",
    actorId: "USR-201",
    now: NOW
  });

  assert.equal(result.ok, false);
  assert.equal(result.code, "INVITATION_FINAL");
  assert.equal(result.state, original);
});

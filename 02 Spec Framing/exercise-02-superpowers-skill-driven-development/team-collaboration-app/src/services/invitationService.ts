import type {
  AcceptInvitationInput,
  CreateInvitationInput,
  InvitationActionResult,
  InvitationErrorCode,
  InvitationState,
  RevokeInvitationInput,
  TeamInvitation,
  TeamMember
} from "../types";
import { canManageInvitations } from "./teamPolicy.ts";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DAY_IN_MILLISECONDS = 86_400_000;

function reject(state: InvitationState, code: InvitationErrorCode): InvitationActionResult {
  return { ok: false, code, state };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isExpired(expiresAt: string, now: string) {
  return Date.parse(expiresAt) <= Date.parse(now);
}

function actorCanManage(state: InvitationState, actorId: string) {
  const actor = state.members.find((member) => member.id === actorId);
  return actor !== undefined && canManageInvitations(actor, state.policy);
}

export function createInvitation(state: InvitationState, input: CreateInvitationInput): InvitationActionResult {
  if (!actorCanManage(state, input.actorId)) {
    return reject(state, "UNAUTHORIZED");
  }

  if (input.role !== "member" && input.role !== "guest") {
    return reject(state, "INVALID_ROLE");
  }

  if (input.role === "guest" && !state.policy.allowGuestInvites) {
    return reject(state, "GUEST_DISABLED");
  }

  const email = normalizeEmail(input.email);
  if (!EMAIL_PATTERN.test(email)) {
    return reject(state, "INVALID_EMAIL");
  }

  if (state.invitations.some((invitation) => invitation.id === input.invitationId)) {
    return reject(state, "DUPLICATE_INVITATION_ID");
  }

  if (state.members.some((member) => normalizeEmail(member.email) === email)) {
    return reject(state, "MEMBER_EXISTS");
  }

  const pendingInvitationExists = state.invitations.some(
    (invitation) =>
      invitation.status === "pending" &&
      !isExpired(invitation.expiresAt, input.now) &&
      normalizeEmail(invitation.email) === email
  );
  if (pendingInvitationExists) {
    return reject(state, "INVITATION_PENDING");
  }

  const invitation: TeamInvitation = {
    id: input.invitationId,
    email,
    role: input.role,
    invitedBy: input.actorId,
    createdAt: input.now,
    expiresAt: new Date(
      Date.parse(input.now) + state.policy.defaultInviteExpiryDays * DAY_IN_MILLISECONDS
    ).toISOString(),
    status: "pending"
  };

  return {
    ok: true,
    invitation,
    state: { ...state, invitations: [...state.invitations, invitation] }
  };
}

export function acceptInvitation(state: InvitationState, input: AcceptInvitationInput): InvitationActionResult {
  const invitation = state.invitations.find((candidate) => candidate.id === input.invitationId);
  if (!invitation) {
    return reject(state, "INVITATION_NOT_FOUND");
  }

  if (invitation.status !== "pending") {
    return reject(state, "INVITATION_FINAL");
  }

  if (isExpired(invitation.expiresAt, input.now)) {
    return reject(state, "INVITATION_EXPIRED");
  }

  if (state.members.some((member) => member.id === input.memberId)) {
    return reject(state, "DUPLICATE_MEMBER_ID");
  }

  const acceptedInvitation: TeamInvitation = { ...invitation, status: "accepted" };
  const member: TeamMember = {
    id: input.memberId,
    name: invitation.email,
    email: invitation.email,
    role: invitation.role,
    status: "active",
    lastActiveDays: 0
  };

  return {
    ok: true,
    invitation: acceptedInvitation,
    state: {
      ...state,
      members: [...state.members, member],
      invitations: state.invitations.map((candidate) =>
        candidate.id === input.invitationId ? acceptedInvitation : candidate
      )
    }
  };
}

export function revokeInvitation(state: InvitationState, input: RevokeInvitationInput): InvitationActionResult {
  if (!actorCanManage(state, input.actorId)) {
    return reject(state, "UNAUTHORIZED");
  }

  const invitation = state.invitations.find((candidate) => candidate.id === input.invitationId);
  if (!invitation) {
    return reject(state, "INVITATION_NOT_FOUND");
  }

  if (invitation.status !== "pending") {
    return reject(state, "INVITATION_FINAL");
  }

  if (isExpired(invitation.expiresAt, input.now)) {
    return reject(state, "INVITATION_EXPIRED");
  }

  const revokedInvitation: TeamInvitation = { ...invitation, status: "revoked" };

  return {
    ok: true,
    invitation: revokedInvitation,
    state: {
      ...state,
      invitations: state.invitations.map((candidate) =>
        candidate.id === input.invitationId ? revokedInvitation : candidate
      )
    }
  };
}

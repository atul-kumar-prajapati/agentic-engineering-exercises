export type TeamRole = "owner" | "admin" | "member" | "guest";

export type MemberStatus = "active" | "suspended";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: MemberStatus;
  lastActiveDays: number;
}

export interface WorkspacePolicy {
  inviteRoles: TeamRole[];
  defaultInviteExpiryDays: number;
  allowGuestInvites: boolean;
}

export type InvitationRole = "member" | "guest";

export type InvitationStatus = "pending" | "accepted" | "revoked";

export interface TeamInvitation {
  id: string;
  email: string;
  role: InvitationRole;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
  status: InvitationStatus;
}

export interface InvitationState {
  members: TeamMember[];
  invitations: TeamInvitation[];
  policy: WorkspacePolicy;
}

export type InvitationErrorCode =
  | "UNAUTHORIZED"
  | "INVALID_EMAIL"
  | "INVALID_ROLE"
  | "GUEST_DISABLED"
  | "MEMBER_EXISTS"
  | "INVITATION_PENDING"
  | "DUPLICATE_INVITATION_ID"
  | "INVITATION_NOT_FOUND"
  | "INVITATION_EXPIRED"
  | "INVITATION_FINAL"
  | "DUPLICATE_MEMBER_ID";

export interface InvitationActionResult {
  ok: boolean;
  state: InvitationState;
  invitation?: TeamInvitation;
  code?: InvitationErrorCode;
}

export interface CreateInvitationInput {
  invitationId: string;
  actorId: string;
  email: string;
  role: InvitationRole;
  now: string;
}

export interface AcceptInvitationInput {
  invitationId: string;
  memberId: string;
  now: string;
}

export interface RevokeInvitationInput {
  invitationId: string;
  actorId: string;
  now: string;
}

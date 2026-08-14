import type {
  AcceptInvitationInput,
  CreateInvitationInput,
  InvitationActionResult,
  InvitationState,
  RevokeInvitationInput
} from "../types";

export function createInvitation(_state: InvitationState, _input: CreateInvitationInput): InvitationActionResult {
  throw new Error("Invitation lifecycle is not implemented");
}

export function acceptInvitation(_state: InvitationState, _input: AcceptInvitationInput): InvitationActionResult {
  throw new Error("Invitation lifecycle is not implemented");
}

export function revokeInvitation(_state: InvitationState, _input: RevokeInvitationInput): InvitationActionResult {
  throw new Error("Invitation lifecycle is not implemented");
}

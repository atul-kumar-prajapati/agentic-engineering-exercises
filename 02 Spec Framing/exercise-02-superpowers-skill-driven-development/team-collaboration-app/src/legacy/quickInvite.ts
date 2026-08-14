import type { InvitationRole, TeamMember } from "../types";

// This abandoned prototype is intentionally unsafe. It is starter evidence, not a pattern to reuse.
export function quickInvite(members: TeamMember[], email: string, role: InvitationRole) {
  members.push({
    id: `legacy-${members.length + 1}`,
    name: email.split("@")[0],
    email,
    role,
    status: "active",
    lastActiveDays: 0
  });

  return members;
}

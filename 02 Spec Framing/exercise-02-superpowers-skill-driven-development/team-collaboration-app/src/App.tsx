import { useRef, useState } from "react";
import type { FormEvent } from "react";

import { members, workspacePolicy } from "./data/team";
import { acceptInvitation, createInvitation, revokeInvitation } from "./services/invitationService";
import { canManageInvitations, summarizeMemberAccess } from "./services/teamPolicy";
import type { InvitationRole, InvitationState } from "./types";

export default function App() {
  const [state, setState] = useState<InvitationState>(() => ({
    members: structuredClone(members),
    invitations: [],
    policy: structuredClone(workspacePolicy)
  }));
  const [actorId, setActorId] = useState("USR-201");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InvitationRole>("member");
  const [feedback, setFeedback] = useState("No invitation actions yet.");
  const invitationSequence = useRef(500);
  const memberSequence = useRef(500);

  function submitInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = createInvitation(state, {
      invitationId: `INV-${invitationSequence.current++}`,
      actorId,
      email,
      role,
      now: new Date().toISOString()
    });

    if (result.ok) {
      setState(result.state);
      setEmail("");
      setFeedback(`Invitation created for ${result.invitation?.email}.`);
      return;
    }

    setFeedback(result.code ?? "Invitation rejected.");
  }

  function accept(invitationId: string) {
    const result = acceptInvitation(state, {
      invitationId,
      memberId: `USR-${memberSequence.current++}`,
      now: new Date().toISOString()
    });

    if (result.ok) {
      setState(result.state);
      setFeedback(`Invitation accepted for ${result.invitation?.email}.`);
      return;
    }

    setFeedback(result.code ?? "Acceptance rejected.");
  }

  function revoke(invitationId: string) {
    const result = revokeInvitation(state, {
      invitationId,
      actorId,
      now: new Date().toISOString()
    });

    if (result.ok) {
      setState(result.state);
      setFeedback(`Invitation revoked for ${result.invitation?.email}.`);
      return;
    }

    setFeedback(result.code ?? "Revocation rejected.");
  }

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Workspace admin</p>
        <h1>Team collaboration console</h1>
        <p>Members and roles exist. Invitation behavior is the unclear feature request for this exercise.</p>
      </section>

      <section className="member-grid">
        {state.members.map((member) => (
          <article className="member-card" key={member.id}>
            <div>
              <p className="eyebrow">{member.id}</p>
              <h2>{member.name}</h2>
            </div>
            <p>{summarizeMemberAccess(member)}</p>
            <dl>
              <div>
                <dt>Role</dt>
                <dd>{member.role}</dd>
              </div>
              <div>
                <dt>Can manage invites</dt>
                <dd>{canManageInvitations(member, state.policy) ? "yes" : "no"}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{member.status}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>

      <section className="invitation-panel" aria-labelledby="team-invitations-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Workspace access</p>
            <h2 id="team-invitations-heading">Team Invitations</h2>
          </div>
          <p>
            Invitations expire after {state.policy.defaultInviteExpiryDays} days. Guest invitations are currently{" "}
            {state.policy.allowGuestInvites ? "enabled" : "disabled"}.
          </p>
        </div>

        <form className="invitation-form" onSubmit={submitInvitation}>
          <label>
            Acting member
            <select value={actorId} onChange={(event) => setActorId(event.target.value)}>
              {state.members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.role}, {member.status})
                </option>
              ))}
            </select>
          </label>

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="person@example.test"
              required
            />
          </label>

          <label>
            Role
            <select value={role} onChange={(event) => setRole(event.target.value as InvitationRole)}>
              <option value="member">Member</option>
              <option value="guest">Guest</option>
            </select>
          </label>

          <button type="submit">Create invitation</button>
        </form>

        <p className="invitation-feedback" role="status" aria-live="polite">
          {feedback}
        </p>

        <div className="invitation-list">
          {state.invitations.length === 0 ? (
            <p className="empty-state">No invitations have been created.</p>
          ) : (
            state.invitations.map((invitation) => (
              <article className="invitation-card" key={invitation.id}>
                <div>
                  <p className="eyebrow">{invitation.id}</p>
                  <h3>{invitation.email}</h3>
                  <p>
                    {invitation.role} · {invitation.status} · expires {new Date(invitation.expiresAt).toLocaleString()}
                  </p>
                </div>
                {invitation.status === "pending" ? (
                  <div className="invitation-actions">
                    <button type="button" onClick={() => accept(invitation.id)}>
                      Accept
                    </button>
                    <button className="secondary" type="button" onClick={() => revoke(invitation.id)}>
                      Revoke
                    </button>
                  </div>
                ) : null}
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

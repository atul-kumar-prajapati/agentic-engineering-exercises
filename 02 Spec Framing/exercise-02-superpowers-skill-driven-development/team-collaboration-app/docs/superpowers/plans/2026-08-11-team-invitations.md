# Team Invitations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an immutable invitation lifecycle with policy enforcement, duplicate prevention, configured expiry, single-use transitions, safe rejection, and a thin React demonstration section.

**Architecture:** Three pure service functions own every lifecycle rule and return `InvitationActionResult` values. The React section maintains in-memory `InvitationState`, invokes those functions, and renders their results without duplicating backend rules.

**Tech Stack:** TypeScript 5.9, React 19, Node.js test runner, Vite 7, npm with the committed lockfile.

## Global Constraints

- Use Node.js 22.12 or newer and below Node 25.
- Do not import or reuse `src/legacy/quickInvite.ts`.
- Normalize stored and compared email addresses by trimming and lowercasing.
- Treat `expiresAt <= now` as expired.
- Rejected actions return the original state unchanged by value.
- Keep the UI in memory; do not add persistence, email delivery, authentication, or dependencies.

---

### Task 1: Record the Red Test and Complete Service Coverage

**Files:**
- Modify: `team-collaboration-app/tests/invitationService.test.ts`
- Create: `evidence/tdd.md`

**Interfaces:**
- Consumes: `createInvitation(state, input)`, `acceptInvitation(state, input)`, and `revokeInvitation(state, input)` from `src/services/invitationService.ts`.
- Produces: executable examples for all `InvitationErrorCode` paths and immutability requirements.

- [ ] **Step 1: Add coverage for actors excluded by workspace policy and successful guest acceptance**

```ts
test("an otherwise active admin excluded by inviteRoles cannot create or revoke", () => {
  const state = makeState([makeInvitation()]);
  state.policy.inviteRoles = ["owner"];
  const snapshot = structuredClone(state);

  expectRejected(createInvitation(state, createInput({ actorId: "USR-228" })), "UNAUTHORIZED", snapshot);
  expectRejected(
    revokeInvitation(state, { invitationId: "INV-401", actorId: "USR-228", now: NOW }),
    "UNAUTHORIZED",
    snapshot
  );
});

test("accepting a guest invitation creates an active guest", () => {
  const state = makeState([makeInvitation({ role: "guest" })]);
  const result = acceptInvitation(state, { invitationId: "INV-401", memberId: "USR-500", now: NOW });

  assert.equal(result.ok, true);
  assert.equal(result.state.members.at(-1)?.role, "guest");
});
```

- [ ] **Step 2: Run the focused suite and preserve the failing output before production code**

Run: `npm run test:invitations`

Expected: FAIL because `invitationService.ts` still throws `Invitation lifecycle is not implemented`.

Create `evidence/tdd.md` with the exact command, timestamp, and unedited output under a `Failing result` heading. Leave a `Passing result` heading for the later green run without inventing output.

- [ ] **Step 3: Commit the red-test checkpoint**

```bash
git add team-collaboration-app/tests/invitationService.test.ts evidence/tdd.md
git commit -m "test: specify invitation lifecycle"
```

---

### Task 2: Implement Immutable Invitation Lifecycle

**Files:**
- Modify: `team-collaboration-app/src/services/invitationService.ts`
- Modify: `evidence/tdd.md`

**Interfaces:**
- Consumes: existing `InvitationState`, action input types, `InvitationActionResult`, `TeamInvitation`, and `canManageInvitations(member, policy)`.
- Produces: `createInvitation(state: InvitationState, input: CreateInvitationInput): InvitationActionResult`, `acceptInvitation(state: InvitationState, input: AcceptInvitationInput): InvitationActionResult`, and `revokeInvitation(state: InvitationState, input: RevokeInvitationInput): InvitationActionResult`.

- [ ] **Step 1: Add shared pure validation helpers**

```ts
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
```

- [ ] **Step 2: Implement creation with validation before allocation**

Validate authorization, role, guest policy, normalized email, duplicate invitation ID, existing member email, and unexpired pending email in the design-specified order. On success, construct:

```ts
const invitation: TeamInvitation = {
  id: input.invitationId,
  email,
  role: input.role,
  invitedBy: input.actorId,
  createdAt: input.now,
  expiresAt: new Date(Date.parse(input.now) + state.policy.defaultInviteExpiryDays * 86_400_000).toISOString(),
  status: "pending"
};

return {
  ok: true,
  invitation,
  state: { ...state, invitations: [...state.invitations, invitation] }
};
```

- [ ] **Step 3: Implement acceptance as one immutable transition**

Find the invitation, reject missing/final/expired invitations and duplicate member IDs, then create an accepted invitation and member:

```ts
const accepted = { ...invitation, status: "accepted" as const };
const member: TeamMember = {
  id: input.memberId,
  name: invitation.email,
  email: invitation.email,
  role: invitation.role,
  status: "active",
  lastActiveDays: 0
};
```

Return new `members` and `invitations` arrays, replacing only the matched invitation.

- [ ] **Step 4: Implement revocation with shared authorization**

Reject unauthorized, missing, final, and expired requests in order. Replace only the matched invitation with `{ ...invitation, status: "revoked" }` and leave the members array unchanged.

- [ ] **Step 5: Run the focused test suite and record the green result**

Run: `npm run test:invitations`

Expected: all invitation tests pass. Append the exact command, timestamp, and unedited output to `evidence/tdd.md` under `Passing result`.

- [ ] **Step 6: Commit the lifecycle implementation**

```bash
git add team-collaboration-app/src/services/invitationService.ts evidence/tdd.md
git commit -m "feat: implement invitation lifecycle"
```

---

### Task 3: Add the Thin Team Invitations Section

**Files:**
- Modify: `team-collaboration-app/src/App.tsx`
- Modify: `team-collaboration-app/src/styles.css`

**Interfaces:**
- Consumes: the three invitation service functions and `InvitationState`.
- Produces: a visible section that demonstrates creation, acceptance, revocation, status, expiry, and safe error reporting.

- [ ] **Step 1: Add React state and action handlers**

Initialize state from cloned `members` and `workspacePolicy`, plus empty invitations. Track actor ID, email, role, and feedback. Generate IDs from a local counter or timestamp. Every handler follows this shape:

```ts
const result = createInvitation(state, {
  invitationId: `INV-${Date.now()}`,
  actorId,
  email,
  role,
  now: new Date().toISOString()
});

if (result.ok) {
  setState(result.state);
  setFeedback("Invitation created.");
} else {
  setFeedback(result.code ?? "Invitation rejected.");
}
```

Acceptance and revocation call their corresponding service exports and update React state only when `result.ok` is true.

- [ ] **Step 2: Render creation controls and lifecycle list**

Add a semantic section headed `Team Invitations`, labelled actor/email/role controls, a submit button, an accessible feedback region, and invitation rows containing email, role, status, expiry, Accept, and Revoke controls. Do not reproduce policy validation in JSX.

- [ ] **Step 3: Add focused styles using existing visual tokens**

Extend the current CSS with invitation form layout, invitation list/card layout, feedback styling, and responsive behavior. Reuse existing colors, radii, spacing, and typography rather than adding a separate visual system.

- [ ] **Step 4: Verify service tests and static correctness**

Run these commands separately:

```bash
npm run test:invitations
npm run typecheck
npm run build
```

Expected: all commands exit 0 and the build contains the Team Invitations section.

- [ ] **Step 5: Commit the UI integration**

```bash
git add team-collaboration-app/src/App.tsx team-collaboration-app/src/styles.css
git commit -m "feat: add team invitations section"
```

---

### Task 4: Review, Evidence, and Final Verification

**Files:**
- Create: `evidence/after.md`
- Create: `evidence/after.patch`
- Create: `evidence/comparison.md`
- Create: `evidence/skill-usage.md`
- Create: `evidence/review.md`
- Modify: `evidence/tdd.md`

**Interfaces:**
- Consumes: approved design, implementation plan, git history, test logs, implementation diff, and code-review findings.
- Produces: honest Superpowers workflow evidence and final command results.

- [ ] **Step 1: Invoke `superpowers:requesting-code-review` and review the implementation**

Review the diff against `docs/invitation-contract.md` and the approved design. Record every finding with severity, affected file, resolution, and verification in `evidence/review.md`. If findings require changes, invoke `superpowers:receiving-code-review`, verify each finding technically, fix it, and rerun focused tests.

- [ ] **Step 2: Write after-run and skill evidence**

Record the agent, model, tools, permissions, 60-minute limit, attempt number, exact prompt, investigation, design approval, plan, TDD, implementation, review, and verification in `evidence/after.md`. List every invoked local Superpowers skill and its artifact/result in `evidence/skill-usage.md`.

- [ ] **Step 3: Generate the after patch and honest comparison**

Generate `evidence/after.patch` from the feature implementation diff. In `evidence/comparison.md`, state that no implementation-producing pre-Superpowers run exists in this task and therefore a valid `before.patch` cannot be reconstructed. Do not fabricate `evidence/before.md` or `evidence/before.patch`.

- [ ] **Step 4: Invoke `superpowers:verification-before-completion` and run required commands**

Run separately and preserve their exact results:

```bash
npm run test:invitations
npm run submission:verify
npm run agent:check
```

Expected: invitation and agent checks pass. `submission:verify` may remain incomplete solely because genuine pre-Superpowers evidence was never produced; report that limitation exactly if it occurs.

- [ ] **Step 5: Commit evidence and final verified changes**

```bash
git add docs/superpowers evidence team-collaboration-app
git commit -m "docs: record invitation workflow evidence"
```

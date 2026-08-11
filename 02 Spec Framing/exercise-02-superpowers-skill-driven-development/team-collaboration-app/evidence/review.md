# Team Invitations Code Review

- Date: 2026-08-11
- Reviewer: independent Codex reviewer subagent
- Reviewed range: `9eb59af8a30308427935b1a7109c3fc462e12fea..30242da3d767d21d51a906a1fdf99a0836d47a1a`
- Requirements: `docs/invitation-contract.md`, approved design, and implementation plan

## Findings and resolutions

### Important: workflow Task 4 was incomplete

- Severity: Important
- Affected file: `docs/superpowers/plans/2026-08-11-team-invitations.md`
- Finding: review evidence, after-run evidence, the final patch, and final verification had not yet been completed at the reviewed commit.
- Resolution: completed the review loop, generated the after-run artifacts, and ran the required verification commands. Genuine pre-Superpowers evidence remains unavailable and is not fabricated.
- Verification: final command results are recorded in `evidence/after.md`.

### Minor: rejection tests did not assert object identity

- Severity: Minor
- Affected file: `team-collaboration-app/tests/invitationService.test.ts`
- Finding: deep equality would not detect returning a deep clone instead of the original state object.
- Resolution: `expectRejected` now asserts strict state identity and separately compares against a value snapshot.
- Verification: the 16 supplied invitation tests and 3 supplemental review tests pass.

### Minor: accepted invitation revocation lacked direct coverage

- Severity: Minor
- Affected file: `team-collaboration-app/tests/invitationService.test.ts`
- Finding: repeated revocation was covered, but revoking an already accepted invitation was not asserted directly.
- Resolution: added a test requiring `INVITATION_FINAL` and unchanged state for accepted-invitation revocation.
- Verification: the 16 supplied invitation tests and 3 supplemental review tests pass.

### Minor: permission display used imported policy

- Severity: Minor
- Affected file: `team-collaboration-app/src/App.tsx`
- Finding: member cards evaluated invitation permission against the imported starter policy rather than the current in-memory policy.
- Resolution: the display now calls `canManageInvitations(member, state.policy)`, matching the service state.
- Verification: focused tests, typecheck, and production build pass.

## Recommendation disposition

The reviewer suggested an optional React integration test. It was not added because this repository has no UI test framework, adding one would expand dependencies, and the agreed scope prioritizes backend lifecycle correctness. The UI remains covered by TypeScript compilation and production build verification.

## Review outcome

The initial assessment was `Ready to merge: With fixes`. The code and test findings were resolved, then supplemental tests were moved into `tests/invitationService.additional.test.ts` to preserve the challenge's protected starter test. The remaining submission limitation is the unavailable pre-Superpowers run evidence.

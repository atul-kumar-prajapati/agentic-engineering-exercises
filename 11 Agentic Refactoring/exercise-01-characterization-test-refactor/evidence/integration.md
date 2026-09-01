# Integration — Exercise 11.1

How the specialist findings were prioritised, verified, and dispositioned. Every accepted claim was re-derived by the integration owner before it entered the evidence; the load-bearing one (the stateful-accessor divergence class) was reproduced with `/tmp/parity/stateful-repro.mjs`, captured in `evidence/commands/stateful-accessor-parity.txt`.

## The one decision that needed judgment

Both review lanes independently found the same structural divergence class in **both** refactors: the first-match-wins decision tables re-read `tier` (up to 3×) and `monthsActive` (up to 2×) per call, where the original's else-if cascade reads each property at most once per branch. For stateful-accessor inputs — per-read-varying getters, self-mutating getters, read-once Proxies — outputs diverge from the original (verified: `plan-not-supported` → `eligible`/`pro-tenure`; `plan-not-supported` → `manual-review`/`payment-history`; a clean return → a thrown `Error`), while every stable-property input, all 49,392 sweep variations, and all ten protected golden observations remain identical.

Options considered:

1. **Post-hoc fix of the module** (a read-parity-faithful structure preserving the original's single-read semantics). Rejected: the README mandates that the refactor come from a fresh agent session under first-attempt conditions; an integration edit after the fact would contaminate the matched-condition experiment that *is* this exercise. It would also be legal-but-misleading under the gates (a second single-file commit could become the recorded `refactorSha`) — exactly the kind of checker-shaped history the submission standard warns against.
2. **Silent documentation.** Rejected: an unreported check is not evidence, and a finding this material belongs in the comparison, not in a footnote.
3. **Document and defer, with prominent disclosure.** Chosen: the finding is recorded in `after.md`, `before.md`, `comparison.md`, both affected lane handoffs, this file, and the PR description, classified as a deferred follow-up in the same spirit as the exercise's own preserve/suspected-bug discipline. The exercise's behavioral contract is the ten golden observations; the divergence class lies beyond them, and no gate covers it. The user is the approver for any follow-up change, exactly as for the suspected bugs.

## Per-finding disposition (all lanes)

| Lane | Finding | Disposition |
|---|---|---|
| Before-attempt review | Stateful-accessor output divergence in the before refactor (re-read predicates) | Accepted — documented (`before.md`, `comparison.md` dimension 1); no code action, the attempt stands uncorrected per the README |
| Before-attempt review | Harness blind spots: plain-data-only grid, "sparse" variant is a no-op mislabel, comparator checks only three field values and throw checks only threw/didn't-throw | Accepted — documented (`comparison.md` dimension 6); the harness belongs to the recorded attempt and is not amended |
| Before-attempt review | Embedded oracle is a faithful verbatim copy of the original (its central claim) | Accepted — verified independently by the lane and by the integration owner; recorded as a *checked* claim, not a defect |
| Behavior parity | Six divergences + one side-effect-count divergence on stateful-accessor inputs in the after refactor | Accepted — documented and **deferred** (see the decision above); re-derived by the integration owner |
| Behavior parity | Value-level parity clean across 152,880 exotic-value combinations; key order, mutation isolation, strictness, bad receivers, NaN semantics all identical | Accepted — recorded as clean checks in the handoff and `comparison.md` |
| Evidence integrity | `after.md` scope inconsistency between patch-scoped and commit-scoped "Changed files"/"Lines added and removed" fields | Accepted — **fixed** before the evidence commit: both files now state their scope explicitly, with cumulative patch totals added |
| Evidence integrity | All machine-checked contracts clean (substrings, floors, SHAs, hashes, numstats, history rules, protected inputs) | Accepted — recorded; re-confirmed by the final gate runs in `evidence/verification.md` |

## Rejected or dismissed claims

None. No lane claim was found inaccurate on re-derivation; the two predicted divergence scenarios and the read-once-Proxy throw were reproduced exactly as reported, and the evidence-integrity lane's single finding was confirmed by inspection and fixed. The absence of dismissed claims is itself recorded here, per the review discipline: the round that found nothing to reject was a round whose every claim survived independent re-derivation, including two adversarial reviews that each tried to break a green result.

## Priority order used

Gates and contract compliance first (evidence-integrity lane: one wording fix, applied immediately); then behavioral truth (parity lane: the divergence class — highest-value finding of the session, documented and deferred); then review completeness (before-attempt lane: the six README dimensions, now answered with a real finding instead of a clean-sheet).

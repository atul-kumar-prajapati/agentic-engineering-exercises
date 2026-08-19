# Security and Accessibility Review — review-base..review-head

- Base SHA: f81c3e56a46338c77cce0d0e81b8ae150db5da19
- Head SHA: 8292b946c6a756980ecaf6aa1d99adf7105ea597
- Reviewer session: opencode-glm-5.3-review-gauntlet-01 (opencode, model glm-5.3)
- Scanner: Semgrep rule `react-dangerous-html-review` (see `evidence/semgrep.txt`; the shipped `semgrep.yml` is invalid YAML and its literal pattern does not parse, so an equivalent rule with the same id, message, severity, and languages was executed — the protected file was not modified)
- Merge decision: **Request changes** — two critical and two high confirmed blockers; the safe static scanner finding is dismissed with source proof.

## Findings summary

| ID | Severity | Source | Decision | Location (head) | Classification |
|---|---|---|---|---|---|
| SEC-001 | critical | semgrep | fix | src/components/ActionComposer.tsx:31 | True positive |
| SCAN-001 | info | semgrep | dismiss | src/components/SafeAnnouncement.tsx:7 | False positive (proved) |
| A11Y-001 | high | manual | fix | src/components/WorkQueue.tsx:16 | Manual blocker |
| VAL-001 | high | manual | fix | src/components/ActionComposer.tsx:48 | Manual blocker |
| POL-001 | critical | manual | fix | src/server/reviewPolicy.ts:4 | Manual blocker |

## SEC-001 — dynamic reviewer-note HTML sink (True positive, critical)

The PR adds `<div className="review-preview" dangerouslySetInnerHTML={{ __html: note }} />` at `src/components/ActionComposer.tsx:31`. `note` is reviewer-controlled React state fed from the note textarea, so typing `<img src=x onerror=...>` executes script in the application origin on every render. Reproduced by tracing the data flow from the textarea through `useState` into the sink with no sanitization; the Semgrep warning is confirmed as a genuine, exploitable injection. Fix: render the preview as a plain React text child (`{note}`), which React auto-escapes. Regression: `tests/review-regressions.test.ts` (notes render as text, no `dangerouslySetInnerHTML` in the composer).

## SCAN-001 — static announcement sink (False positive, dismissed)

The same Semgrep rule also flags `src/components/SafeAnnouncement.tsx:7`. Source proof of safety: the injected value is `trustedAnnouncement`, a module-level `const` string literal defined at `SafeAnnouncement.tsx:1` with no interpolation, props, state, or user input anywhere in the eight-line file. The HTML is static and source-controlled, so no runtime data can reach the sink. Dismissed — and deliberately **retained** in the codebase rather than silenced, per the review brief; the component check gate asserts it remains.

## A11Y-001 — queue rows lost native button semantics (manual, high)

The PR replaces the queue's `<button type="button">` rows with `<div onClick=...>` at `src/components/WorkQueue.tsx:16`. Keyboard-only users can neither focus nor activate a row (no `tabIndex`, no key handler, no `role`), and screen readers announce generic text instead of an interactive control. Fix: restore native `<button type="button">` rows, which restores tab focus plus Enter/Space activation and button semantics. Regression: `tests/review-regressions.test.ts` (rows are native keyboard-operable buttons).

## VAL-001 — client note validation removed (manual, high)

The save button at `src/components/ActionComposer.tsx:48` lost `disabled={saving || note.trim().length < 8}` and its explicit `type="button"`. A short or empty note is submitted the moment the button is clickable, and the head server simultaneously lost its note-length check, so nothing rejects it anywhere. Fix: restore the client guard and `type="button"`, and restore the server's meaningful-reviewer-note validation (see POL-001). Regression: `tests/review-regressions.test.ts` (short notes fail at the server boundary; client guard present).

## POL-001 — approval wording bypasses server transitions (manual, critical)

`assertAllowedTransition` at `src/server/reviewPolicy.ts:4` returns early whenever the note contains the substring "approved", skipping both the note-length validation that the base enforced and the rule that Blocked/Escalated work cannot transition directly to Ready. Reproduced: `assertAllowedTransition({status:'Blocked'}, {note:'approved by reviewer', status:'Ready'})` returns without throwing — exactly the input the protected `reviewPolicy.test.ts` expects to throw `/cannot transition/`. The client compounds it by coercing High-priority drafts to Ready when the note says approved (`ActionComposer.tsx:18-19` in the head). Fix: delete the early return, restore the eight-character guard ahead of the Blocked/Escalated-to-Ready rule, and remove the client-side coercion. Regression: `tests/review-regressions.test.ts` (Blocked and Escalated to Ready with "approved" wording both throw).

## Merge decision

**Request changes.** The head ships an exploitable XSS sink (SEC-001), a server authorization bypass reachable by note wording (POL-001), a mouse-only work queue (A11Y-001), and no note validation anywhere (VAL-001). All four confirmed blockers are fixed at their smallest correct boundary in remediation commit `8b68ece04bbbfa2958ca8a777795714b906716d0` together with focused learner regression tests; the safe static scanner finding (SCAN-001) is dismissed with source evidence and retained. Structural verdict recorded in `evidence/review.json` with `mergeDecision: "request-changes"` against the vulnerable head.

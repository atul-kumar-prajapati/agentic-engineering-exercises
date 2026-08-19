# Before — vulnerable head state

- Review base SHA: f81c3e56a46338c77cce0d0e81b8ae150db5da19
- Review head SHA: 8292b946c6a756980ecaf6aa1d99adf7105ea597
- Reviewer agent and model: opencode, glm-5.3 (opencode-go/glm-5.3); two read-only specialist subagents (security/policy lane and a11y/validation lane, both opencode glm-5.3)
- Tools and permissions: read-only review pass — file reads, non-mutating git (bundle verify, clone checkout, diff), Semgrep scan in a temp clone, inline `node -e` reproductions of the policy function; no file writes to the app, no mutating git commands
- Time limit: 45 minutes (exercise README)
- Human hints: 0
- Patch: `evidence/before.patch`

## Baseline commands and exit codes (vulnerable starter, before any fix)

| Command | Exit | Result |
|---|---|---|
| `npm ci` | 0 | dependencies installed |
| `npm run test:integrity` | 0 | Verified 42 protected challenge inputs |
| `node ../scripts/verify-review-fixture.mjs` | 0 | Review fixture verified: review-base..review-head |
| `npm run test:review` | 1 | fails — `tests/review-regressions.test.ts` does not exist and component checks fail on the vulnerable head |
| `npm run review:verify` | 1 | fails — no `evidence/review.json` / review documents yet |
| `npm run agent:check` | 0 | integrity, lint, self-tests, format, typecheck, build all pass on the vulnerable head (quality gates cannot see the seeded defects) |
| Semgrep scan of the review head | 0 | 2 findings: `react-dangerous-html-review` in `src/components/ActionComposer.tsx` and `src/components/SafeAnnouncement.tsx` (raw output: `evidence/semgrep.txt`) |

## Baseline counts

- Scanner findings: 2 — 1 true positive (SEC-001, dynamic reviewer-note sink) and 1 false positive (SCAN-001, static source-controlled announcement)
- Manual blockers (no scanner warning): 3 — A11Y-001 (queue rows are `div`s, keyboard-inoperable), VAL-001 (short-note client validation and `type="button"` removed), POL-001 (note wording "approved" bypasses server note validation and the Blocked/Escalated→Ready guard; client additionally coerces High-priority drafts to Ready)
- Missing regression tests: 4 areas — untrusted note rendering, queue keyboard behavior, note validation, and blocked/escalated transition rules (no `tests/` directory exists at the head)
- Fixed findings: 0 / dismissed findings: 0 at this point

## Notes

- The review range was verified against the protected bundle before any inspection: bundle refs match the manifest SHAs and the generated diff is byte-equivalent (modulo line endings) to `pr/review-target.diff`.
- The shipped `semgrep.yml` is invalid YAML (unquoted pattern containing `__html: $SOURCE`) and its literal pattern fails Semgrep pattern parsing; an equivalent rule (same id, message, severity, languages; parseable JSX pattern) was executed against the head instead. The protected file was not modified. See the header of `evidence/semgrep.txt`.
- Both specialist lanes independently reached the same five classifications; their sub-findings (screen-reader semantics loss, server note-length removal, client status coercion, implicit form submission risk) were folded into the five contract findings rather than reported separately.

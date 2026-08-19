# After — remediated state

- Remediation commit: 8b68ece04bbbfa2958ca8a777795714b906716d0 (full SHA; fixes and learner tests)
- Recheck agent and model: opencode, glm-5.3 (opencode-go/glm-5.3); one adversarial read-only recheck subagent (same model) — verdict: remediation sound, no defects found
- Tools and permissions: same session and permissions as the before pass (read-only review powers plus file writes limited to the exercise app and `evidence/`); no mutating operations on protected inputs
- Patch: `evidence/after.patch`

## Gate results after remediation

| Command | Exit |
|---|---|
| `npm run test:review` | 0 — 2 test files, 18 tests passed; component checks: notes render without an untrusted HTML sink, client note validation and explicit button type restored, queue rows use native keyboard-operable buttons, deliberate source-controlled scanner finding retained |
| `npm run review:verify` | 0 — Source SHA 8b68ece04bbbfa2958ca8a777795714b906716d0; PASS exact protected base-to-head review range, five required findings, dynamic HTML true positive / static false positive decisions, keyboard/validation/server policy fixes, Git source binding (captured in `evidence/commands/review-verify.txt` with HEAD at the remediation commit) |
| `npm run agent:check` | 0 — integrity (42 protected inputs), lint, self-tests, format, typecheck, build all pass |

## Disposition

- Fixed finding IDs: SEC-001, A11Y-001, VAL-001, POL-001
- Dismissed finding IDs: SCAN-001 (proved false positive — static, source-controlled markup; retained in the codebase, not silenced)
- Regression tests added: `tests/review-regressions.test.ts` — 13 learner assertions across 4 suites covering untrusted note rendering (no `dangerouslySetInnerHTML` in the composer, note rendered as text), keyboard-operable native button queue rows, short-note rejection at the server boundary plus the restored client guard, and Blocked/Escalated→Ready rejection even with "approved" wording (plus the removed client coercion)
- Files changed: 5 — `src/components/ActionComposer.tsx`, `src/components/WorkQueue.tsx`, `src/server/reviewPolicy.ts`, `tests/review-regressions.test.ts`, `tests/raw-modules.d.ts`
- Lines added / removed: 78 added, 8 removed (`git diff --numstat 3761a42840cbbc4ee9143ecc914519b4f8c6cc0c 8b68ece04bbbfa2958ca8a777795714b906716d0`)
- The safe static scanner finding remains in `src/components/SafeAnnouncement.tsx` exactly as shipped; SafeAnnouncement is not part of the remediation.

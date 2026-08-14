# Accessibility Specialist Report — Before

- Specialist: Accessibility
- Agent and session ID: `accessibility-before-agent` / `accessibility-before-d41347c`
- Phase: before
- Reviewed commit SHA: `d41347c7a0249193e53a06d0c7717e361216ab89`
- Reviewed paths: `nfr-swarm-app/src/components/AccessReviewQueue.tsx`
- Verification command: `npm run review:accessibility`
- Exit code: `1`
- Result: findings

| ID | Severity | File and line | Keyboard reproduction | Impact | Recommendation |
|---|---|---|---|---|---|
| A11Y-01 | blocker | `nfr-swarm-app/src/components/AccessReviewQueue.tsx:13` | Each row is a plain clickable `div`. Tab does not focus it, and Enter or Space cannot invoke selection. The focused markup test found zero native buttons and no selected-state contract. | Keyboard-only users cannot select a review, so they cannot complete the access-review workflow; assistive technology also receives no selected state. | Use `button type="button"` for every row and expose selection with `aria-pressed`. |

Keyboard evidence and the failing assertion are retained in `evidence/commands/accessibility-before.txt`. This is a required blocker handed to the integration owner.

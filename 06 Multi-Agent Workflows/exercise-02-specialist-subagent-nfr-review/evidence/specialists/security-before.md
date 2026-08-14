# Security Specialist Report — Before

- Specialist: Security
- Agent and session ID: `security-before-agent` / `security-before-d41347c`
- Phase: before
- Reviewed commit SHA: `d41347c7a0249193e53a06d0c7717e361216ab89`
- Reviewed paths: `nfr-swarm-app/src/components/ReviewNote.tsx`, `nfr-swarm-app/src/services/accessReviewApi.ts`
- Verification command: `npm run review:security`
- Exit code: `1`
- Result: findings

| ID | Severity | File and line | Reproduction | Impact | Recommendation |
|---|---|---|---|---|---|
| SEC-01 | blocker | `nfr-swarm-app/src/components/ReviewNote.tsx:6` | Rendering a hostile note containing `<img src=x onerror="alert(1)"><strong>urgent</strong>` emits both tags as live markup because the note is passed to `dangerouslySetInnerHTML`. The protected focused test failed on the emitted `<img>`. | Attacker-controlled request notes can execute script-capable markup in a reviewer session, exposing data or authenticated actions. | Render `note` as a normal React text child so React escapes it. |
| SEC-02 | blocker | `nfr-swarm-app/src/services/accessReviewApi.ts:5` | Direct calls bypass the UI: the function accepts no actor, performs no authorization or evidence checks, and unconditionally returns `approved`. The focused test received `window is not defined` rather than `MISSING_EVIDENCE`, and `ApprovalError` did not exist. | Privileged access can be approved without authority or complete evidence at the service boundary. | Accept an explicit actor and injected wait, then return structured `NOT_AUTHORIZED` and `MISSING_EVIDENCE` failures before approval. |

The complete reproduction output is retained in `evidence/commands/security-before.txt`. Both findings are required blockers and are handed to the integration owner for triage and remediation.

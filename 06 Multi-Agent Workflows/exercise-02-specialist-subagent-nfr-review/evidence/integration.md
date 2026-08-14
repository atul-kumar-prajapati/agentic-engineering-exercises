# Integration Record

## Provenance

- Baseline SHA: `d41347c7a0249193e53a06d0c7717e361216ab89`
- Remediation SHA: `92a6bf13692ece72499c53fa23d1678d85a0693b`
- Base: `upstream/feature/improve-exercise-challenges`

## Specialist triage

Four independent before sessions produced five unique required blockers. The accountable integration owner reproduced each finding and chose `fix` for all five. No finding was deferred or dismissed because every reported finding is required by the protected risk seeds. `SEC-02` and `TEST-01` share one service file, so the integration owner implemented one coherent boundary change while retaining separate security and deterministic-test verification.

## Changed paths

The source-only remediation commit changed exactly `src/App.tsx`, `src/components/AccessReviewQueue.tsx`, `src/components/ReviewNote.tsx`, `src/services/accessReviewApi.ts`, and `src/utils/accessReviewRisk.ts`. No specialist edited application code, and no protected input changed.

## Final checks and merge decision

Fresh security, accessibility, performance, and testability specialists all passed their focused commands at the remediation SHA. Comparable performance improved from `106.914 ms` to `0.022 ms`. The complete `npm run verify:exercise` result is captured in `evidence/commands/verify-exercise.txt`. Merge decision: **approve** after that complete gate passes.

## Rollback and remaining risk

Rollback: `git revert 92a6bf13692ece72499c53fa23d1678d85a0693b`. Remaining risk: the approval API is an in-browser simulation; production deployments must enforce the same authorization and evidence rules on the real server. No scoped required blocker remains.

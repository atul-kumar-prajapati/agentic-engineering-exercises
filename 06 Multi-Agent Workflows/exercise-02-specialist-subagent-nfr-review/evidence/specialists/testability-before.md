# Testability Specialist Report — Before

- Specialist: Testability
- Agent and session ID: `testability-before-agent` / `testability-before-d41347c`
- Phase: before
- Reviewed commit SHA: `d41347c7a0249193e53a06d0c7717e361216ab89`
- Reviewed paths: `nfr-swarm-app/src/services/accessReviewApi.ts`
- Verification command: `npm run review:testability`
- Exit code: `1`
- Result: findings

| ID | Severity | File and line | Reproduction | Impact | Recommendation |
|---|---|---|---|---|---|
| TEST-01 | blocker | `nfr-swarm-app/src/services/accessReviewApi.ts:3` | Supplying an injected no-op wait has no effect because the service ignores the dependency and calls `window.setTimeout`; Node throws `window is not defined`. There is also no deterministic failure boundary because the service always approves. Both focused tests failed. | Approval success and failure cannot be tested deterministically outside a browser and require ambient globals and real time. | Accept an optional injected wait dependency, use a platform-neutral default timer, and expose structured deterministic validation failures. |

The complete deterministic-boundary failure is retained in `evidence/commands/testability-before.txt`. This blocker overlaps the security service finding but has separate testability acceptance criteria; one integration-owner change will address both without duplicate ownership.

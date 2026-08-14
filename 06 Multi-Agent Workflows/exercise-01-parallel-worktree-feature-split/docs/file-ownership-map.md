# File Ownership Map

| Lane | Branch | Owned paths | Forbidden shared path | Reviewer |
|---|---|---|---|---|
| A, saved filters | `lane/saved-filters` | `src/components/FilterBar.tsx`, `src/utils/filters.ts`, `tests/lane-a/**` | `src/types.ts` | integration owner |
| B, SLA risk | `lane/sla-risk` | `src/utils/scoring.ts`, `src/components/MetricStrip.tsx`, `tests/lane-b/**` | `src/types.ts` | integration owner |
| C, evidence export | `lane/evidence-export` | `src/components/EvidencePanel.tsx`, `src/services/workflowApi.ts`, `tests/lane-c/**` | `src/types.ts` | integration owner |
| Integration | `integration/parallel-features` | `src/types.ts`, `src/utils/filters.ts`, `src/services/workflowApi.ts`, `evidence/**` | lane implementation files | accountable engineer |

A lane must stop and record a request if it needs any other path. Silent cross-lane edits fail scope control. Only the integration owner may resolve the two declared shared-type requests.

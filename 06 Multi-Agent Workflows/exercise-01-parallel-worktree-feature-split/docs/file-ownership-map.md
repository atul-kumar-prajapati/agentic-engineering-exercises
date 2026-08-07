# File Ownership Map

| Lane | Branch | Owned paths | Forbidden shared path | Reviewer |
|---|---|---|---|---|
| A, saved filters | `lane/saved-filters` | `FilterBar.tsx`, `filters.ts`, filter tests | `src/types.ts` | integration owner |
| B, SLA risk | `lane/sla-risk` | `scoring.ts`, `MetricStrip.tsx`, scoring tests | none | integration owner |
| C, evidence export | `lane/evidence-export` | `EvidencePanel.tsx`, `workflowApi.ts`, evidence tests | `src/types.ts` | integration owner |
| Integration | learner-defined | `src/types.ts`, integration log | none | accountable engineer |

A lane must stop and request ownership if it discovers a required change outside its paths. The handoff must name the request; silent cross-lane edits fail scope control.

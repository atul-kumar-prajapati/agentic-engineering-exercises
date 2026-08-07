# Three-Lane Product Task Board

All lanes start from the same recorded base SHA. Do not invent replacement tasks.

## Lane A: Saved queue filters

Add a named saved-filter preset for High-priority Blocked work. The preset must use the existing filter behavior and remain searchable.

- Owned paths: `src/components/FilterBar.tsx`, `src/utils/filters.ts`, related filter tests.
- Focused verification: `npm test -- filters` or the equivalent test file command added by the lane.
- Shared-file request: add `FilterPreset` to `src/types.ts` through the integration owner.

## Lane B: SLA risk indicator

Show a distinct metric for work due today and ensure due-today Blocked work remains critical.

- Owned paths: `src/utils/scoring.ts`, `src/components/MetricStrip.tsx`, related scoring tests.
- Focused verification: `npm test -- scoring` or the equivalent test file command added by the lane.
- No shared-file ownership.

## Lane C: Evidence export

Add an export action that produces a JSON evidence bundle for the selected work item, including its ID, owner, status, risk, and collected evidence.

- Owned paths: `src/components/EvidencePanel.tsx`, `src/services/workflowApi.ts`, related evidence tests.
- Focused verification: `npm test -- evidence` or the equivalent test file command added by the lane.
- Shared-file request: add `EvidenceBundle` to `src/types.ts` through the integration owner.

## Controlled Conflict

Lanes A and C both need `src/types.ts`, but neither owns it. Each lane must record its requested type change without editing that file. The integration owner applies both requests in one documented shared-file commit after the lane commits are ready.

Integration order is B, A, C, then the shared-file resolution. If a lane cannot pass its focused check, mark it blocked and do not cherry-pick it.

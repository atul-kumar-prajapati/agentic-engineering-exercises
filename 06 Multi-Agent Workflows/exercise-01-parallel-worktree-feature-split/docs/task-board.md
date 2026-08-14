# Three-Lane Product Task Board

All lanes start from the same clean base SHA. Each lane creates one commit and remains inside its owned paths.

## Lane A: Saved queue filters

Add a `High-priority Blocked` preset to the filter bar. Applying it sets priority to `High` and status to `Blocked` while preserving the current search query.

- Owned paths: `src/components/FilterBar.tsx`, `src/utils/filters.ts`, and `tests/lane-a/**`.
- Required API: export `savedFilterPresets` and `applyFilterPreset` from `filters.ts`.
- Focused verification: `npm run test:lane-a`.
- Shared request: promote the lane-local `FilterPreset` interface to `src/types.ts` during integration.

## Lane B: SLA risk indicator

Add a `Due today` portfolio metric. Count all items where `dueInDays` is zero and preserve the rule that a due-today Blocked item is `Critical`.

- Owned paths: `src/utils/scoring.ts`, `src/components/MetricStrip.tsx`, and `tests/lane-b/**`.
- Required API: `summarizePortfolio` returns `dueToday`; `MetricStrip` renders the metric.
- Focused verification: `npm run test:lane-b`.
- No shared-file ownership.

## Lane C: Evidence export

Add an `Export JSON` action for collected evidence. The serialized bundle contains the selected item's ID, owner, status, calculated risk, evidence entries, and generation time.

- Owned paths: `src/components/EvidencePanel.tsx`, `src/services/workflowApi.ts`, and `tests/lane-c/**`.
- Required API: export `createEvidenceBundle` and `serializeEvidenceBundle` from `workflowApi.ts`; render `Export JSON` only when evidence exists.
- Focused verification: `npm run test:lane-c`.
- Shared request: promote the lane-local `EvidenceBundle` interface to `src/types.ts` during integration.

## Controlled Conflict

Lanes A and C define temporary structural interfaces inside their owned utility or service file so their commits remain independently testable. They must request promotion without editing `src/types.ts`.

The integration owner merges B, A, and C with `--no-ff`, then creates one commit that adds both interfaces to `src/types.ts` and replaces the two temporary definitions with imports. Do not merge a lane whose focused check fails.

# Ownership Map

| Path | Current reservation | Waiting card | Rule |
|---|---|---|---|
| `src/utils/scoring.ts` | ESC-120 | ESC-122 | ESC-120 must merge or release before ESC-122 starts. |
| `src/services/workflowApi.ts` | none | ESC-118 | Reserve only after reproduction is attached. |

Cancelled card ESC-121 owns no paths. The integration owner must update this file whenever card state or reservation changes.

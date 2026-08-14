# Ownership Map Seed

| Requested path | Active reservation | Waiting card | Required action |
|---|---|---|---|
| `src/utils/scoring.ts` | ESC-120 and ESC-122 | ESC-122 | Keep ESC-120 only; release ESC-122. |
| `src/components/SeverityBadge.tsx` | ESC-120 | ESC-122 | Release after ESC-120 integration. |
| `src/services/workflowApi.ts` | ESC-118 | ESC-118 | Release until reproduction exists. |
| `src/services/exportApi.ts` | ESC-121 | none | Release because the card is cancelled. |

After integration, no card owns an active reservation. ESC-122 still requests the scoring paths but remains blocked by `RULE-ESC-122`.

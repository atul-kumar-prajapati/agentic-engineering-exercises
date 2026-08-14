# Final Ownership Map

There are no active reservations. Requested paths remain on the cards for audit history, but waiting, blocked, merged, and cancelled work owns no file reservation.

| Requested path | Historical requester | Final owner | Control decision |
|---|---|---|---|
| `src/utils/scoring.ts` | ESC-120 and ESC-122 | none | ESC-120 was integrated and released; ESC-122 remains blocked by `RULE-ESC-122`. |
| `src/components/SeverityBadge.tsx` | ESC-120 and ESC-122 | none | Released after the accepted ESC-120 merge; ESC-122 cannot reserve it. |
| `tests/esc-120/` | ESC-120 | none | Released after the regression test was reviewed and merged. |
| `src/services/workflowApi.ts` | ESC-118 | none | Released until `REPRO-118` supplies deterministic evidence. |
| `src/services/exportApi.ts` | ESC-121 | none | Released because ESC-121 is cancelled; unsafe input was not used. |

ESC-118, ESC-120, ESC-121, and ESC-122 remain visible, while exclusive ownership has ended cleanly for the completed lane.

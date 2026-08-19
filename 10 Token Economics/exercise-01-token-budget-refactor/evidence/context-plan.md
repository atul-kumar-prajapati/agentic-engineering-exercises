# Context plan (before any selector change)

This plan is for the session-adapter refactor. It is written from the protected catalog metadata (`docs/context-catalog.json`) plus the one open question below. It is committed before `selectContext.mjs` or learner tests change.

## Starting point (before)

The starter selector loads every catalog source and ignores the maximum. Catalogued cost of that unbudgeted load is 2580 UTF-8 bytes: repository-rules 489, current-adapter-contract 647, current-error-contract 426, legacy-migration-notes 412, ui-style-guide 310, audit-retention 296. That pack includes stale authority and two unrelated current documents.

## Maximum

`maximumBytes` is 1700. That is enough for mandatory rules plus the current adapter contract (1136) and, if the open question is in scope, the current error contract (1562 total), and it is the budget the protected acceptance suite uses for the adapter task. It is not enough to reload the 2580-byte dump.

## Mandatory

`repository-rules` is the only catalog row with `mandatory: true`. Its tags are `["mandatory"]`, authority is current, priority 1000, 489 bytes. It must be selected first. A budget of 488 bytes must fail because mandatory context does not fit; we will not skip it to make a smaller pack.

## Authority and relevance

Current primary sources beat stale, unrelated, or secondary notes:

- `current-adapter-contract` (647 bytes, tags adapter/session/api, current, priority 100) is the primary contract for this task. Select it when it fits after mandatory.
- `current-error-contract` (426 bytes, tags errors/validation, current, priority 90) is not in the initial tag set. It is selected only because of the open question below (question tag `errors`).
- `legacy-migration-notes` shares adapter/session/api tags and has a higher numeric priority (200) than the current adapter contract, but its authority is stale. Never select it to save bytes or because priority looks larger.
- `ui-style-guide` and `audit-retention` are current but unrelated (ui/css/accessibility and audit/retention/privacy). Skip as irrelevant.

Expected selected IDs, in mandatory-then-priority order: `repository-rules`, `current-adapter-contract`, `current-error-contract` (1562 bytes, 138 remaining).

## Open question

The adapter contract says missing `userId` is rejected and `expiresAt` must stay ISO-8601, but it does not name the error type, codes, or exact public messages. That is the open question that adds question tag `errors` and pulls in `current-error-contract`. No other expansion is planned: UI and audit documents do not answer it, and the stale migration notes contradict current authority.

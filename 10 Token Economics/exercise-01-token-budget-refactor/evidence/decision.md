# Decision: planned versus actual context

## Planned

Pre-change plan (`planSha` `8d94b4c9daa55fecba34f36c9b643aec78ec803a`) set tags `adapter` and `session`, question tag `errors`, maximum 1700, mandatory `repository-rules`, and expected selected IDs `repository-rules`, `current-adapter-contract`, `current-error-contract`. Planned skip IDs were `legacy-migration-notes`, `ui-style-guide`, and `audit-retention`. Planned total was 1562 UTF-8 bytes.

## Actual

Selector output at `sourceSha` `bb581c4941be75cebb31d57d7247e20efc192d20`, stored unmodified in `evidence/context-ledger.json`, selected the same three IDs in that order. Actual totalBytes is 1562, remainingBytes 138, requestedTags `["adapter","errors","session"]`, unresolvedTags `[]`. Skip reasons: `audit-retention` irrelevant, `legacy-migration-notes` stale, `ui-style-guide` irrelevant.

## Expanded

The pack was expanded from the 1136-byte initial adapter set (`repository-rules` + `current-adapter-contract`) by the open question on error type, codes, messages, and validation order. That question tag selected `current-error-contract` (426 bytes). No further expansion was applied.

## Stale

`legacy-migration-notes` matches adapter/session/api tags and has priority 200, higher than the current adapter contract's 100 (`docs/context-catalog.json:5`). It was skipped with reason `stale` and did not consume budget. Selecting it because it is smaller (412 vs 647) would have been a defect.

## Verification

Protected `npm run test:context` and learner tests both exited 0. `verifyContextEvidence` requires the ledger `result` fields to JSON-equal a fresh `selectContext` run of the plan; that is the unmodified ledger. History: plan commit contains only the two plan files; source commit contains only `selectContext.mjs` and `tests/context-selector.test.mjs`; later commits are evidence-only.

## Correctness

Mandatory repository rules are always selected. Current primary sources beat stale and unrelated documents. Question-driven expansion is the only reason the error contract is present. Tight budget 1000 keeps only `repository-rules` and records `budget` plus unresolved `adapter`/`session`. Budget 488 throws `/mandatory context/i` rather than dropping rules.

## Trade-off

Unbudgeted load is 2580 bytes. Actual selected load is 1562 bytes (138 remaining under 1700). The cost cut drops stale migration notes and unrelated UI/audit guidance. Correctness is preserved because the omitted files are not current authority for `adaptSession`. The trade-off is that an agent without the error contract would have to invent messages; we accepted the 426-byte expansion rather than that risk.

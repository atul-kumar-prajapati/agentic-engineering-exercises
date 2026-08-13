# Before: normal repository search

- Date: 2026-08-13 (Asia/Calcutta)
- Attempt: first and only baseline attempt
- Agent: fresh Codex subagent, same parent-selected model as the graph-first run, with no model override
- Tools and permissions: scoped PowerShell/read/search/apply-patch tools with repository workspace write access; no network or graph tool
- Time limit: the exercise-wide limit was 30 minutes or less; this run stopped after its first implementation and first verification attempt
- Starting commit: `5d9b3a6305b3c6f86fd6dafc30f6d1f244110dcd`
- Starting scoped diff: clean
- Method: normal repository filename search, text search, and source inspection

## Exact implementation request

Recognized revenue for a charge is `grossAmount - credits`; a refund reduces recognized revenue by its gross amount; totals are grouped by billing account, never tenant; every event must resolve through tenant-to-account mapping and missing mappings must throw rather than create a grouping key; preserve unrelated metrics. Answer the five questions in `docs/graph-questions.md` before editing, then make one genuine first implementation.

## Answers before editing

1. `recognizedRevenueByAccount` in `billing-graph-app/src/billing/recognizedRevenue.ts` calculates the metric. The agent found no UI or scheduled-job import in the current source tree; the stale extract's `RevenueDashboard` edge was not supported by source.
2. `TenantAccountLink` and the `links` argument in `recognizedRevenue.ts` represent the tenant-to-billing-account mapping. The starter implementation ignored the argument.
3. `docs/current-metric-contract.md` is the approved source defining credits and refunds.
4. The approved contract names Billing Platform as calculation owner and Support Analytics as consumer-only.
5. `docs/graph-extract.md` is explicitly stale and can misdirect work toward nonexistent `RevenueDashboard`, `IngestBillingEvents`, and `finance-metrics.md` nodes.

## Exact chronological file access and commands

1. `Get-ChildItem -Force` from the exercise root listed `billing-graph-app`, `docs`, and `README.md`; no contents opened. Exit 0.
2. `rg --files -g AGENTS.md -g !README.md -g !lab-contract.json -g !challenge-integrity.json` looked for scoped instructions; no matches. Exit 1.
3. `rg --files billing-graph-app` enumerated the entire app tree, including UI components, verification scripts, package files, and `src/billing/recognizedRevenue.ts`; no contents opened. Exit 0.
4. `rg --files docs` enumerated `graph-questions.md`, `graph-extract.md`, and `current-metric-contract.md`; no contents opened. Exit 0.
5. `rg -n -i "recognized revenue|recognizedRevenue|billing account|billingAccount|tenant|credit|refund|owner|team" billing-graph-app\src docs` content-searched `docs/graph-extract.md`, `docs/graph-questions.md`, `docs/current-metric-contract.md`, `src/labContract.ts`, `src/billing/recognizedRevenue.ts`, `src/components/SkillPatternBoard.tsx`, and `src/types.ts`. Exit 0.
6. `rg -n "recognizedRevenueByAccount|recognizedRevenue" billing-graph-app\src` found only the declaration in `src/billing/recognizedRevenue.ts`, with no source consumer/import. Exit 0.
7. `Get-Content -Raw billing-graph-app\src\billing\recognizedRevenue.ts; Get-Content -Raw billing-graph-app\src\App.tsx; Get-Content -Raw billing-graph-app\src\main.tsx` opened the calculation plus two possible but ultimately wrong consumer files. Exit 0.
8. `rg -n -i "dashboard|revenue|billing_events|consumer|consume|finance|analytics|platform|job|edge|maps_to|owned_by|reads" billing-graph-app\src docs` searched calculation, app, contract, lab metadata, graph questions/extract, and an evidence UI component. Exit 0.
9. `Get-Content -Raw docs\current-metric-contract.md; Get-Content -Raw docs\graph-extract.md` opened the approved contract and stale extract. Exit 0.
10. `Get-Content -Raw billing-graph-app\package.json; git status --short -- billing-graph-app` opened package scripts and confirmed a clean app path. Exit 0.
11. `apply_patch` changed only `billing-graph-app/src/billing/recognizedRevenue.ts`. Success.
12. `npm run test:billing` from `billing-graph-app` failed before npm or the billing test script ran because PowerShell blocked `C:\Program Files\nodejs\npm.ps1`. Exit 1. Per the first-attempt rule, the agent did not rerun or revise.

Wrong files opened as possible consumers: `src/App.tsx` and `src/main.tsx`. Broad search also touched matches in `src/labContract.ts`, `src/components/SkillPatternBoard.tsx`, and `src/types.ts` that were not implementation dependencies.

## First implementation and assumptions

The patch built a tenant/account map, threw for missing mappings, subtracted credits from charges, negated refunds by gross amount, and accumulated only by billing account. It assumed refund credits are ignored because the approved contract says refunds reduce revenue by gross amount; duplicate tenant links use the last mapping; empty events still return `{}`. It did not invent a UI/job consumer that source did not contain.

## First verification result

- Command: `npm run test:billing`
- Result: did not execute due to the Windows PowerShell `npm.ps1` execution-policy error (exit 1)
- Relevant artifact: `evidence/before.patch`
- Requirement connection: this preserves the genuine first verification outcome without a corrective rerun.

## Changed files

- `billing-graph-app/src/billing/recognizedRevenue.ts`

# After: Graphify-first

- Date: 2026-08-13 (Asia/Calcutta)
- Attempt: first and only graph-first attempt
- Agent: fresh Codex subagent, same parent-selected model as the baseline, with no model override
- Tools and permissions: the same scoped PowerShell/read/search/apply-patch capabilities and repository workspace write access, plus the exercise-local Graphify 0.9.41 CLI and its prebuilt code-only graph
- Time limit: the exercise-wide limit was 30 minutes or less; this run stopped after its first implementation and first verification attempt
- Starting commit: `5d9b3a6305b3c6f86fd6dafc30f6d1f244110dcd`
- Starting source state: the baseline implementation had been reverted exactly to blob `084ec0a1703eb87f099007a4c3c80312bb53a3e4`
- Method: scoped graph query/path/explain before raw source access, followed by source verification for missing or ambiguous edges

## Exact implementation request

Recognized revenue for a charge is `grossAmount - credits`; a refund reduces recognized revenue by its gross amount; totals are grouped by billing account, never tenant; every event must resolve through tenant-to-account mapping and missing mappings must throw rather than create a grouping key; preserve unrelated metrics. Answer the five questions in `docs/graph-questions.md` before editing, then make one genuine first implementation.

## Answers before editing

1. Graphify located `recognizedRevenueByAccount()` in `src/billing/recognizedRevenue.ts`. Its degree-one containment edge and failed paths to `App()`/`EvidenceLedger()` did not prove the absence of consumers, so scoped source search verified that only `scripts/run-billing-tests.mjs` executes it; there is no current UI or scheduled-job consumer.
2. Graphify located `TenantAccountLink` beside the calculation. Because it exposed no event-to-link resolution edge, source inspection verified the link shape in `recognizedRevenue.ts`, fixtures in `scripts/run-billing-tests.mjs`, and the approved mapping rule in `docs/current-metric-contract.md`.
3. The code-only graph could not represent metric semantics. `docs/current-metric-contract.md` was opened to verify the approved charge and refund rules, with executable examples in `scripts/run-billing-tests.mjs`.
4. The code-only graph had no team ownership edge. `docs/current-metric-contract.md` verified Billing Platform as owner and Support Analytics as consumer-only; `src/labContract.ts` independently assigns the calculation/mapping work to Billing Platform.
5. The code-only graph had no document nodes. `docs/graph-extract.md` was source-verified as stale and incomplete; its `RevenueDashboard`, `IngestBillingEvents`, and `finance-metrics.md` claims are not supported by the current code-only graph or source tree.

## Exact chronological commands and file access

1. `graphify.exe query --help` was interpreted as a query and returned `No matching nodes found.`
2. `graphify.exe --help` printed CLI usage.
3. `graphify query "Which function calculates recognized revenue and which UI or job consumes it?" --graph ".\graphify-out\graph.json" --budget 3000` found the calculation file/function only.
4. `graphify query "Where is a tenant mapped to its billing account?" ...` found `TenantAccountLink`, `BillingEvent`, and the calculation file/function.
5. `graphify query "Which source defines whether credits and refunds reduce recognized revenue?" ...` did not surface the contract and included an unrelated `source` symbol.
6. `graphify query "Which team owns the recognized revenue calculation and which team only consumes it?" ...` found calculation nodes only.
7. `graphify query "Which stale document or inferred edge could send an agent to the wrong file for recognized revenue?" ...` returned unrelated app/script nodes and no document node.
8. `graphify explain "recognizedRevenueByAccount()" --graph ".\graphify-out\graph.json"` showed degree one and only an extracted containment edge.
9. `graphify explain "TenantAccountLink" ...` showed degree one and only an extracted containment edge.
10. `graphify path "recognizedRevenueByAccount()" "App()" ...` found no directed path.
11. `graphify path "recognizedRevenueByAccount()" "EvidenceLedger()" ...` found no directed path.
12. `graphify path "BillingEvent" "TenantAccountLink" ...` found no directed path.
13. `graphify explain "recognizedRevenue.ts" ...` showed only three extracted containment edges.
14. `graphify query "imports or calls recognizedRevenueByAccount" ...` returned only the calculation function.
15. `graphify query "billing account tenant mapping resolver function" ...` returned calculation-local types/function only.
16. `graphify query "recognized revenue tests credits refunds gross amount billing account" ...` narrowed source verification to `scripts/run-billing-tests.mjs` and the calculation file.
17. `graphify query "revenue dashboard settlement export nightly job owner team" ...` returned calculation-local nodes only.
18. Numbered `Get-Content` opened `billing-graph-app/src/billing/recognizedRevenue.ts`.
19. Numbered `Get-Content` opened `billing-graph-app/scripts/run-billing-tests.mjs`.
20. Scoped `rg` searched only `billing-graph-app`, excluding `node_modules`, graph output, and `dist`.
21. Scoped `rg` searched only this exercise, excluding dependencies and graph output, to resolve document and ownership gaps.
22. Numbered `Get-Content` opened `docs/current-metric-contract.md`.
23. Numbered `Get-Content` opened `docs/graph-extract.md`.
24. Numbered `Get-Content` opened `billing-graph-app/src/labContract.ts`.
25. `apply_patch` changed only `billing-graph-app/src/billing/recognizedRevenue.ts`.
26. `node .\scripts\run-billing-tests.mjs` from `billing-graph-app` failed before tests ran with `ERR_MODULE_NOT_FOUND: Cannot find package 'vite'`. The agent did not install, revise, or rerun.

Directly opened files, in order: `src/billing/recognizedRevenue.ts`, `scripts/run-billing-tests.mjs`, `docs/current-metric-contract.md`, `docs/graph-extract.md`, and `src/labContract.ts`. No UI entry file was opened. Scoped searches surfaced `index.html`, `lab-contract.json`, the already-created baseline evidence, graph questions, and README, but these were not opened or modified by the agent.

## Graph gaps and source verification

- Extracted: the calculation, `BillingEvent`, and `TenantAccountLink` are contained by `recognizedRevenue.ts`.
- Missing: parameter-use/resolution from events and links into the calculation; verified in `src/billing/recognizedRevenue.ts` and `scripts/run-billing-tests.mjs`.
- Missing: executable UI/job consumer edge; a scoped symbol search verified only the test harness consumer. No unsupported consumer was invented.
- Missing: credit/refund semantic edge and tenant/account policy; verified in `docs/current-metric-contract.md` and protected billing examples.
- Missing: ownership edge; verified in `docs/current-metric-contract.md` and `src/labContract.ts`.
- Missing by design: stale-document nodes because extraction was `--code-only`; verified in `docs/graph-extract.md`.
- The graph contained 100% extracted and 0% inferred/ambiguous edges. Absence results were treated as gaps, not facts.

## First implementation and assumptions

The patch built a tenant/account map, rejected missing or empty account mappings, subtracted credits from charges, negated refunds by gross amount, and accumulated only by billing account. It assumed refund credits are ignored because the approved contract says refunds reduce revenue by gross amount; duplicate tenant links use the final mapping; empty events return `{}`. It did not invent a current UI/job consumer.

## First verification result

- Command: `node .\scripts\run-billing-tests.mjs`
- Result: dependencies were not installed, so Node failed on missing `vite` before tests ran (exit 1)
- Relevant artifact: `evidence/after.patch`
- Requirement connection: this is the unaltered first verification outcome; dependency installation and final gates occur only after this first-attempt record was frozen.

## Changed files

- `billing-graph-app/src/billing/recognizedRevenue.ts`

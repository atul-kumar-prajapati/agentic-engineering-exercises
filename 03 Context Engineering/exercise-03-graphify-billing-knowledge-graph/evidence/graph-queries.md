# Graphify command and source-verification log

- Date: 2026-08-13 (Asia/Calcutta)
- Corpus: `billing-graph-app` only
- Graphify: `0.9.41`, installed in `billing-graph-app/node_modules/.graphify-venv`
- Graph mode: code-only local AST extraction; no semantic LLM, document, paper, image, or external graph content
- Starting commit: `5d9b3a6305b3c6f86fd6dafc30f6d1f244110dcd`
- Result: `graphify-out/graph.json` contains 108 nodes and 121 edges across 13 communities; `GRAPH_REPORT.md` reports 100% EXTRACTED, 0% INFERRED, and 0% AMBIGUOUS edges

Commands below were run from the exercise root. The executable prefix was `billing-graph-app\node_modules\.graphify-venv\Scripts\graphify.exe`.

## Graph construction

1. `graphify --version` — `graphify 0.9.41`.
2. `graphify --help` — confirmed `extract`, `query`, `path`, and `explain` support.
3. `graphify extract ".\billing-graph-app" --code-only --out "."` — exit 0; scanned 19 code files, skipped one non-code document and `styles.css`, wrote a real 108-node/121-edge graph. Graphify reported that `challenge-integrity.json` and `lab-contract.json` produced no AST nodes.
4. `graphify cluster-only "." --graph ".\graphify-out\graph.json" --no-label --no-viz` — exit 0; generated `GRAPH_REPORT.md`, retained 13 unlabeled communities, and deliberately skipped HTML because it is not a requested deliverable.

## Primary orientation before the fresh graph-first agent

1. `graphify query "Which function calculates recognized revenue and which UI or scheduled job consumes it?" --graph ".\graphify-out\graph.json" --budget 3000` — found `recognizedRevenue.ts`, `recognizedRevenueByAccount()`, `BillingEvent`, and `TenantAccountLink`; only extracted containment edges, no consumer.
2. `graphify query "Where is a tenant mapped to its billing account?" --graph ".\graphify-out\graph.json" --budget 3000` — narrowed mapping vocabulary to `TenantAccountLink` in the calculation file.
3. `graphify query "Which source defines whether credits and refunds reduce recognized revenue?" --graph ".\graphify-out\graph.json" --budget 3000` — returned the calculation plus an unrelated `source` variable from `lint-check.mjs`; it did not answer the policy question.
4. `graphify query "Which team owns the recognized revenue calculation and which team only consumes it?" --graph ".\graphify-out\graph.json" --budget 3000` — returned the calculation nodes but no owner/team edge.
5. `graphify query "Which stale document or inferred edge could send an agent to the wrong file?" --graph ".\graphify-out\graph.json" --budget 3000` — expanded broadly to unrelated app and verification nodes because a code-only graph contains no document nodes; this result was marked unhelpful, not accepted as fact.
6. `graphify path "TenantAccountLink" "recognizedRevenueByAccount()" --graph ".\graphify-out\graph.json"` — no directed path.
7. `graphify path "recognizedRevenueByAccount()" "App()" --graph ".\graphify-out\graph.json"` — no directed path.
8. `graphify path "TenantAccountLink" "recognizedRevenueByAccount()" --graph ".\graphify-out\graph.json" --undirected` — extracted two-hop containment path through `recognizedRevenue.ts`.
9. `graphify path "recognizedRevenueByAccount()" "App()" --graph ".\graphify-out\graph.json" --undirected` — no path, even ignoring direction.
10. `graphify explain "recognizedRevenueByAccount()" --graph ".\graphify-out\graph.json"` — degree one; only the extracted file-containment edge at `src/billing/recognizedRevenue.ts:L14`.
11. `graphify explain "TenantAccountLink" --graph ".\graphify-out\graph.json"` — degree one; only the extracted file-containment edge at `src/billing/recognizedRevenue.ts:L8`.

## Fresh graph-first agent command log

These commands were the agent's own first-attempt orientation. They are retained even where they repeat the primary orientation, because they demonstrate that the fresh agent queried before opening source.

1. `graphify query --help` — the CLI interpreted `--help` as a query and returned no matching nodes.
2. `graphify --help` — printed command usage.
3. `graphify query "Which function calculates recognized revenue and which UI or job consumes it?" --graph ".\graphify-out\graph.json" --budget 3000` — calculation only; no consumer edge.
4. `graphify query "Where is a tenant mapped to its billing account?" --graph ".\graphify-out\graph.json" --budget 3000` — calculation-local mapping type.
5. `graphify query "Which source defines whether credits and refunds reduce recognized revenue?" --graph ".\graphify-out\graph.json" --budget 3000` — contract absent; unrelated `source` node included.
6. `graphify query "Which team owns the recognized revenue calculation and which team only consumes it?" --graph ".\graphify-out\graph.json" --budget 3000` — no ownership edge.
7. `graphify query "Which stale document or inferred edge could send an agent to the wrong file for recognized revenue?" --graph ".\graphify-out\graph.json" --budget 3000` — unrelated code nodes; no document evidence.
8. `graphify explain "recognizedRevenueByAccount()" --graph ".\graphify-out\graph.json"` — degree one, containment only.
9. `graphify explain "TenantAccountLink" --graph ".\graphify-out\graph.json"` — degree one, containment only.
10. `graphify path "recognizedRevenueByAccount()" "App()" --graph ".\graphify-out\graph.json"` — no directed path.
11. `graphify path "recognizedRevenueByAccount()" "EvidenceLedger()" --graph ".\graphify-out\graph.json"` — no directed path.
12. `graphify path "BillingEvent" "TenantAccountLink" --graph ".\graphify-out\graph.json"` — no directed path, exposing the missing resolution edge.
13. `graphify explain "recognizedRevenue.ts" --graph ".\graphify-out\graph.json"` — only three extracted containment edges.
14. `graphify query "imports or calls recognizedRevenueByAccount" --graph ".\graphify-out\graph.json" --budget 3000` — calculation node only.
15. `graphify query "billing account tenant mapping resolver function" --graph ".\graphify-out\graph.json" --budget 3000` — calculation-local types/function only.
16. `graphify query "recognized revenue tests credits refunds gross amount billing account" --graph ".\graphify-out\graph.json" --budget 3000` — narrowed verification to `scripts/run-billing-tests.mjs` and `src/billing/recognizedRevenue.ts`.
17. `graphify query "revenue dashboard settlement export nightly job owner team" --graph ".\graphify-out\graph.json" --budget 3000` — calculation-local nodes only; no executable UI/job consumer.

## Answers and important edge verification

| Graph question | Graph result | Source verified | Conclusion |
|---|---|---|---|
| Calculation and consumers | `graphify query`, `graphify explain`, and `graphify path` identified `recognizedRevenueByAccount()` but no caller/import edge. | `billing-graph-app/src/billing/recognizedRevenue.ts:14`; scoped symbol search; `billing-graph-app/scripts/run-billing-tests.mjs:18`. | The function calculates the metric. The only current executable consumer is the protected test harness; no UI or scheduled-job consumer exists in current source. Missing edges were not accepted as proof until the scoped source search. |
| Tenant-to-account mapping | Query located `TenantAccountLink`; the undirected path showed only shared file containment, and the directed event-to-link path was missing. | `billing-graph-app/src/billing/recognizedRevenue.ts:8`; fixtures at `billing-graph-app/scripts/run-billing-tests.mjs:19`; policy at `docs/current-metric-contract.md:8`. | The link list is the mapping input. Every event must resolve through it, and the implementation must group by `billingAccountId`. |
| Credits and refunds | Code-only query could not answer policy semantics. | Approved contract at `docs/current-metric-contract.md:3` and rules at lines 6-7; protected examples at `billing-graph-app/scripts/run-billing-tests.mjs:24` and line 34. | Charges contribute `grossAmount - credits`; refunds contribute `-grossAmount`. |
| Ownership | Query returned no team edge. | `docs/current-metric-contract.md:4` and line 10; corroborating work ownership in `billing-graph-app/src/labContract.ts:17`. | Billing Platform owns the calculation. Support Analytics is consumer-only. |
| Stale/wrong source | Code-only query could not represent documents and returned unrelated nodes. | `docs/graph-extract.md:3` marks the extract stale/incomplete; lines 7, 9, and 10 contain the unsupported `RevenueDashboard`, wrong-owner `IngestBillingEvents`, and stale `finance-metrics.md` claims; line 12 says it predates credits and the bridge. | The historical extract can send an agent to wrong or nonexistent files. It is evidence of risk, not an authoritative graph edge. |

## Confidence handling and missing edges

The graph itself contains only EXTRACTED edges, so no inferred edge was accepted. Important missing edges were explicitly source verified: parameter use, tenant-to-account resolution, semantic charge/refund policy, ownership, and current consumer absence. The final code-only graph intentionally excludes the approved and stale documents; their claims were checked in raw source only after scoped graph queries showed that gap.

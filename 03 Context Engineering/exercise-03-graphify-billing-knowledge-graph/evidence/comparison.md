# Normal search versus Graphify-first

- Date: 2026-08-13 (Asia/Calcutta)
- Starting commit for both: `5d9b3a6305b3c6f86fd6dafc30f6d1f244110dcd`
- Same agent conditions: two genuinely fresh Codex subagents inherited the same parent-selected model with no override, worked under the same scoped filesystem permissions and exercise-wide 30-minute limit, received the same five questions and exact implementation request, and each stopped after its first implementation and first verification attempt.
- Controlled difference: the baseline used normal repository search with no graph intervention; the after run had Graphify 0.9.41, the real prebuilt code-only graph, and the rule to query/path/explain before raw source access.

## Outcome summary

| Measure | Normal search first attempt | Graphify-first first attempt |
|---|---:|---:|
| Direct files opened | 6 | 5 |
| Wrong candidate files directly opened | 2 (`src/App.tsx`, `src/main.tsx`) | 0 |
| Implementation files changed | 1 | 1 |
| Unsupported consumer/owner claims made | 0 | 0 |
| Explicit graph gaps identified and source verified | Not applicable | 5 categories |
| First verification | `npm run test:billing` blocked by PowerShell execution policy before tests | direct Node test runner blocked by missing `vite` before tests |

The graph-first context reduced wrong direct file opens from two to zero and total direct opens from six to five. That is a modest but concrete reduction, not a claim that graph lookup eliminated source inspection. The graph correctly focused the agent on the calculation/mapping file and showed no path into the UI, while its test-oriented query selected the protected billing runner. Ownership and metric semantics still required documents because `--code-only` deliberately omitted them.

## File-selection comparison

The normal-search agent enumerated the entire app, ran broad text searches, then opened `src/App.tsx` and `src/main.tsx` as possible consumers. Neither consumed the billing calculation. Broad matches also touched lab and generic UI metadata that were not implementation dependencies.

The graph-first agent opened, in order, the calculation, the executable billing test, the approved metric contract, the stale extract, and the lab ownership source. All five supported one of the required graph questions or the edit. Its later scoped searches surfaced unrelated filenames—including already-created baseline evidence and README—but it did not open or modify them. Therefore the defensible comparison is based on direct file reads, not inflated search-result counts.

## Assumption comparison

Both first attempts made the same source-supported decisions: refund credits are ignored because refunds reduce revenue by gross amount; duplicate tenant mappings use the last `Map` entry; empty events preserve `{}`; and no UI/job consumer should be invented. Both correctly identified Billing Platform as owner and Support Analytics as consumer-only.

Graphify did not independently supply policy or ownership. Its value was to make uncertainty visible:

- `recognizedRevenueByAccount()` and `TenantAccountLink` each had only containment edges.
- There was no event-to-mapping resolution edge.
- There was no path from the calculation to `App()`.
- There was no team/owner edge.
- Code-only extraction contained no current or stale document nodes.

The graph-first agent consequently labeled five edge categories as missing and source verified each before using it. The baseline also avoided unsupported final claims, but it arrived there through broader search rather than an explicit confidence/gap audit. Neither run fabricated an inferred edge or a baseline failure.

## Patch comparison

Both genuine first-attempt patches fix the protected behaviors in `recognizedRevenue.ts`: resolve through the tenant/account links, reject missing mappings, subtract credits for charges, negate refunds, and accumulate by billing account. They are not identical:

- `evidence/before.patch` rejects only `undefined` mapping lookup results.
- `evidence/after.patch` also rejects an empty `billingAccountId`, matching the contract's requirement that every event resolve to a real account key rather than creating an empty grouping key.

No tests or protected files were edited by either agent because the existing protected billing runner already expresses all five required behaviors.

## Verification fairness and limitation

The preserved first verification commands differed because each fresh agent independently chose its command. Neither command reached the assertions: baseline hit the Windows `npm.ps1` policy, while graph-first used the direct Node runner but dependencies had not yet been installed. Those failures are reported as environment/setup outcomes, not evidence that either implementation behavior failed.

After both first attempts and patches were frozen, dependencies were installed once and the required final verification was run against the graph-first patch. This post-experiment verification does not rewrite either first-attempt record.

Final verification from `billing-graph-app`:

- `npm.cmd run test:billing` — 5 billing checks passed, including credits, account grouping, refunds, missing mapping, and input immutability.
- `npm.cmd run test:submission` — graph artifacts, scoped queries, comparison, and genuine patches passed the submission verifier.
- `npm.cmd run agent:check` — protected integrity (6 inputs), lint, agent check, format, typecheck, and production build all passed.

## Conclusion

Graph-first context reduced wrong files and made unsupported assumptions easier to audit, but it did not replace source verification. The strongest demonstrated benefit is precision: two fewer wrong direct opens, immediate focus on the calculation/mapping community, and an explicit record of which important relationships the code-only graph could not prove.

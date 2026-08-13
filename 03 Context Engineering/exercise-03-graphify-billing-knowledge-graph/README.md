# Exercise 03 : Graphify Billing Knowledge Graph

## Your Mission

Your mission is to fix a billing incident whose rules and dependencies are spread across code and conflicting documents.

The dashboard and scheduled snapshot overstate recognized revenue and split one billing account across multiple tenants. A previous agent followed stale metric and ownership information and incorrectly marked the work complete.

Use Graphify to identify the calculation, mapping, consumers, current rules, and owning team before implementing the fix.

Compare the agent's implementation before and after using graph-first context.

The duration for this challenge is 30 min or less.

## Project

[billing-graph-app](./billing-graph-app) contains the application code, partial fix, and conflicting incident information.

Use this request for both agent runs:

> Correct recognized-revenue totals in the dashboard and scheduled snapshot. Use the current metric rules and billing-account boundaries, preserve gross-volume behaviour, and reject events without a valid account mapping.

The request does not identify the safe edit path or authoritative sources. Answer the supplied [graph questions](./docs/graph-questions.md) before editing.

## How To Go About It

Install [Graphify](https://github.com/Graphify-Labs/graphify) and register its skill for your coding agent:

```bash
uv tool install graphifyy
graphify install --project --platform agents
```

Start a fresh agent session without Graphify. Provide the incident request and repository, answer the graph questions using normal search, save the first implementation and observations, then revert the implementation.

Build a graph for the complete exercise directory so it includes both code and documents. Use `graphify query`, `graphify path`, and `graphify explain` to answer the same questions before opening source files.

Record every command and relevant result in `evidence/graph-queries.md`. Treat `INFERRED` or `AMBIGUOUS` edges as leads only and verify important ones against their source files.

Start another fresh agent session with the graph available. Provide the same request and graph questions. The agent must query the graph before inspecting source and implementing the fix.

Use the same agent, model, tools, permissions, prompt, time limit, and first attempt for both runs. Do not rerun either implementation.

## Evidence

Submit:

- The completed recognized-revenue fix and regression tests.
- `graphify-out/graph.json`, `graphify-out/graph.html`, and `graphify-out/GRAPH_REPORT.md`.
- `evidence/graph-queries.md` containing the questions, commands, results, and source verification.
- `evidence/graph-audit.md` showing current sources retained and stale or unsupported claims excluded.
- `evidence/before.md` and `evidence/before.patch`.
- `evidence/after.md` and `evidence/after.patch`.
- `evidence/comparison.md` comparing file access, assumptions, and implementation results.
- Output from `npm run test:billing`, `npm run test:graph`, and `npm run agent:check`.
- A focused pull request containing only the exercise changes.

Use the [evidence template](./docs/evidence-template.md) and follow the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

The graph must identify the calculation, tenant-to-account mapping, dashboard and snapshot consumers, current metric contract, and owning team. Important inferred or ambiguous edges must be source verified.

The final implementation must calculate net recognized revenue, group it by billing account, reject missing mappings, preserve gross volume, and keep both consumers consistent.

The exercise is incomplete if the graph is fabricated, the runs are not comparable, source files are opened before graph queries in the graph-first run, stale guidance is treated as current, protected inputs are changed, or the required checks fail.

See the [evaluation rubric](../../docs/EVALUATION_RUBRICS.md#graphify-billing-knowledge-graph).

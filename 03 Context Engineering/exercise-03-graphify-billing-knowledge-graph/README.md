# Exercise 03 : Graphify Billing Knowledge Graph

## Your Mission

Your team cannot safely fix a billing incident because the calculation, account mapping, consumers, ownership, and current rules are spread across code and conflicting documents. Your mission is to build and query a repository knowledge graph before changing the billing flow.

The dashboard and scheduled snapshot overstate recognized revenue and split one billing account across tenants. A previous agent followed stale metric and ownership information and incorrectly marked the work complete.

Use Graphify, then prove whether graph-first context improves the same agent's first-attempt result.

The duration for this challenge is 30 min or less.

## Project

[billing-graph-app](./billing-graph-app) is a billing application with a partial fix, two downstream consumers, mapping rules, and conflicting incident documents.

Use this incident request in both implementation sessions:

> Correct recognized-revenue totals in the dashboard and scheduled snapshot. Use the current metric rules and billing-account boundaries, preserve gross-volume behaviour, and reject events without a valid account mapping.

The request does not identify the safe edit path or authoritative sources. Answer the supplied [graph questions](./docs/graph-questions.md) before editing.

## How To Go About It

1. Create two branches from the same starting commit. The second branch must not contain the implementation produced in the first branch.

2. In the first branch, start a fresh agent session without Graphify. Give it the incident request, answer the graph questions using normal repository search, and keep its first implementation without hints, corrections, or retries. Save `evidence/before.md` and `evidence/before.patch`.

3. Install [Graphify](https://github.com/Graphify-Labs/graphify) and register its skill for your coding agent. Build a graph for the complete exercise directory so code and documents are both included.

4. Use `graphify query`, `graphify path`, and `graphify explain` to answer the same questions before opening source files. Record commands and relevant results in `evidence/graph-queries.md`. Treat inferred or ambiguous edges only as leads and verify important claims against their sources.

5. In the second branch, start a fresh agent session with the graph available. Give it the same incident request and graph questions using the same agent, model, tools, permissions, time limit, and first-attempt condition.

6. The agent must query the graph before inspecting source and implementing the fix. Do not provide hints, corrections, or retries. Keep its implementation and regression tests.

7. Save the graph outputs, `evidence/after.md`, `evidence/after.patch`, `evidence/graph-audit.md`, and `evidence/comparison.md`. Raise the final PR only from the second branch.

## Evidence

Submit:

- The completed billing fix and regression tests.
- `graphify-out/graph.json`, `graphify-out/graph.html`, and `graphify-out/GRAPH_REPORT.md`.
- `evidence/graph-queries.md` and `evidence/graph-audit.md`.
- `evidence/before.md` and `evidence/before.patch`.
- `evidence/after.md` and `evidence/after.patch`.
- `evidence/comparison.md` comparing discovery, assumptions, implementation, and verification.
- Output from `npm run verify:exercise`.
- A focused pull request containing only the exercise changes.

Run `npm run verify:exercise` before raising the PR. It checks protected inputs, application quality, billing behavior, graph outputs, source verification, comparable sessions, and required evidence.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- Both branches start from the same commit and both implementation sessions use the same request and working conditions.
- The graph identifies the calculation, tenant-to-account mapping, both consumers, current metric contract, and owning team.
- Important inferred or ambiguous edges are verified against source files before use.
- The final implementation calculates net recognized revenue by billing account, rejects missing mappings, preserves gross volume, and keeps both consumers consistent.
- `npm run verify:exercise` passes and the final PR contains genuine graph outputs and all required proof.

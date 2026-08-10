# Exercise 03 : Graphify Billing Knowledge Graph

## Your Mission

Your mission is to use a codebase knowledge graph to complete a billing change that crosses UI, calculation, tenant mapping, scheduled jobs, documentation, and team ownership.

You are given an incomplete implementation that reports gross charges as revenue and groups results by tenant ID instead of billing account. Search results also point to a stale metric document and the wrong owner.

Use Graphify to identify the real dependency path, correct the implementation, and record any missing or ambiguous graph edges you had to verify in source.

Prove whether graph-first context reduced wrong files and unsupported assumptions compared with a normal repository search.

The duration for this challenge is 30 min or less.

## Project

[billing-graph-app](./billing-graph-app) contains the billing workflow. [graph questions](./docs/graph-questions.md) defines the questions both agent runs must answer before editing.

## How To Go About It

First, ask a fresh agent to answer the graph questions using normal repository search and implement the change. Save its first patch and file-access summary, then revert it.

Install [Graphify](https://github.com/Graphify-Labs/graphify), build a code-only graph, and use scoped `graphify query`, `graphify path`, and `graphify explain` commands before opening source files.

Start a fresh agent with the same conditions and a graph-first instruction. It may inspect raw files only after a graph query narrows the path. Do not treat inferred or ambiguous edges as facts without checking their source.

## Evidence

Submit the billing fix and tests, `graphify-out/graph.json`, `graphify-out/GRAPH_REPORT.md`, `evidence/graph-queries.md`, `evidence/before.md`, `evidence/before.patch`, `evidence/after.md`, `evidence/after.patch`, and `evidence/comparison.md`.

Run `npm run test:billing`, `npm run test:submission`, and `npm run agent:check` from `billing-graph-app`. Record every graph command and the source file used to confirm each important edge.

Raise a focused PR containing only this exercise. Follow the [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

Reviewers will check that graph queries identified the calculation, tenant-to-account mapping, downstream consumers, and owning team before the edit.

The final implementation must calculate net recognized revenue, group it by billing account, preserve unrelated metrics, and pass the protected behavior checks.

The exercise is incomplete if the graph is fabricated, only the report is read, inferred edges are accepted without verification, the comparison is unfair, protected inputs are changed, or required checks fail.

See the [Graphify Billing Knowledge Graph rubric](../../docs/EVALUATION_RUBRICS.md#graphify-billing-knowledge-graph).

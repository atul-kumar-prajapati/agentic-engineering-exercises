# Exercise 05 : Graph-Backed Notification Fallback Rescue

## Your Mission

Your mission is to use a code graph and diagrams to repair a notification fallback that can contact customers through a channel they did not approve.

You are given a stale graph snapshot and routing code that always falls back from push to SMS. The real rule requires SMS consent, email fallback, and a durable queue when no permitted provider is available.

Build a current graph, use it to find the routing boundary, fix the behavior, and create diagrams that another engineer can use to review the change.

The duration for this challenge is 30 min or less.

## Project

[notification-mesh-app](./notification-mesh-app) contains the application and seeded routing defect. [routing contract](./docs/current-routing-contract.md) defines the protected behavior.

## How To Go About It

Build a code-only graph with [Graphify](https://github.com/Graphify-Labs/graphify). Use scoped query and path commands to locate policy, provider, and queue dependencies before opening source files.

Fix the fallback and produce Mermaid architecture and sequence diagrams. Mark inferred graph edges and verify them in source before presenting them as facts.

## Evidence

Submit the fix and tests, `graphify-out/graph.json`, `graphify-out/GRAPH_REPORT.md`, `diagrams/notification-architecture.mmd`, `diagrams/fallback-sequence.mmd`, and `evidence/graph-to-source.md`.

Run `npm run test:routing`, `npm run test:submission`, and `npm run agent:check` from `notification-mesh-app`.

Raise a focused PR containing only this exercise. Follow the [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

Reviewers will check that the graph identified the real routing boundary and that diagrams match source. Push, consented SMS, email fallback, and durable queue behavior must pass protected tests.

The exercise is incomplete if the stale snapshot is copied, graph output is fabricated, inferred edges are unverified, or a disallowed channel can still be selected.

See the [Graph-Backed Notification Fallback Rescue rubric](../../docs/EVALUATION_RUBRICS.md#graph-backed-notification-fallback-rescue).

# Exercise 02 : Source-Verified Code Graph Rescue

## Your Mission

Your team cannot trust its notification architecture diagram because the stored graph is stale and the implementation now bypasses customer consent. Your mission is to generate a graph from source, repair the routing defect, and produce diagrams that match the corrected code.

The current router selects SMS whenever the provider is available, even without consent. The supplied snapshot also contains unsupported relationships that look believable.

Compare a stale-snapshot attempt with a generated-graph workflow and prove every relationship from source.

The duration for this challenge is 45 min or less.

## Project

[notification-mesh-app](./notification-mesh-app) contains the application, graph tools, and seeded routing defect. The [current routing contract](./docs/current-routing-contract.md) is protected; the [graph snapshot](./docs/graph-snapshot.md) is evidence to challenge.

## How To Go About It

1. Create two branches from the same starting commit. The second branch must not contain the graph, diagrams, or fix produced in the first branch.

2. In the first branch, start a fresh agent session with the stale snapshot and task. Do not provide hints, corrections, or retries. Save its result, `evidence/before.md`, and `evidence/before.patch`.

3. Review the first result and the [graph contract](./docs/graph-contract.md). In the second branch, build the graph from source, query `selectNotificationRoute`, and find its path to `durableQueueRoute` before editing code.

4. Start another fresh agent session using the same agent, model, tools, permissions, time limit, and first-attempt condition. Provide the generated graph and current routing contract instead of the stale snapshot.

5. Fix routing so push remains primary, SMS requires consent, email is the next fallback, and the durable queue is used when no permitted immediate channel is available.

6. Create Mermaid dependency and fallback-sequence diagrams. Map DEP-01 through DEP-06 to generated call edges and exact call-site lines. Record every rejected stale claim and why it is unsupported.

7. Commit the implementation and diagrams, generate final graph evidence from that source SHA, save the after and comparison evidence, and raise the PR from the second branch. Final verification rebuilds the graph in a temporary path and must not change the committed artifact.

## Evidence

Submit:

- `artifacts/code-graph.json` and both required Mermaid diagrams.
- `evidence/before.md`, `evidence/before.patch`, `evidence/after.md`, and `evidence/after.patch`.
- `evidence/traceability.json`, `evidence/stale-claims.md`, `evidence/graph-manifest.json`, and `evidence/verification.md`.
- Captured build, query, path, routing-test, and parser outputs under `evidence/commands/`.
- `evidence/comparison.md` with graph accuracy, unsupported edges, routing results, and source coverage.
- Output from `npm run verify:exercise`.
- A focused pull request containing only this exercise.

Run `npm run verify:exercise` before raising the PR. It checks protected inputs, routing behavior, generated graph integrity, Mermaid syntax, exact edge traceability, evidence hashes, and required before-and-after proof.

For the required before and after files, follow the [evidence instructions and template](./docs/evidence-template.md) and the repository [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Completion Criteria

The challenge is complete when:

- Both sessions use matching conditions and genuine first-attempt artifacts.
- The generated graph matches the committed source and is not copied or hand-written from the stale snapshot.
- Push, consented SMS, email fallback, and durable queue behavior pass protected tests.
- Both diagrams parse and every required relationship maps to one generated edge and exact source line.
- Final verification reproduces the graph without changing tracked or untracked repository state.
- `npm run verify:exercise` passes and the final graph, diagrams, source SHA, hashes, and proof agree.

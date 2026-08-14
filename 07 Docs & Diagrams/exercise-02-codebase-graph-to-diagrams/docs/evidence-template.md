# Code Graph Evidence

## traceability.json

```json
{
  "schema_version": 1,
  "source_sha": "40-character Git SHA",
  "edges": [
    {
      "id": "DEP-01",
      "graph_edge_id": "generated call-edge ID",
      "caller": "selectNotificationRoute",
      "callee": "pushAvailable",
      "source_path": "src/notification/routeNotification.mjs",
      "source_lines": [1],
      "source_excerpts": ["exact source line"],
      "diagram_paths": ["diagrams/notification-dependencies.mmd", "diagrams/fallback-sequence.mmd"]
    }
  ]
}
```

Add `DEP-01` through `DEP-06`. Copy edge IDs and locations from the generated graph; do not estimate them.

## stale-claims.md

Record `STALE-01` through `STALE-06` in snapshot order. For each claim, state `Result: supported` or `Result: rejected`, cite the generated edge or exact source location, and explain the decision.

## graph-manifest.json

Record `source_sha`; the path and SHA-256 of the graph, both diagrams, `traceability.json`, and `stale-claims.md`; and the exact command, exit code, output path, and output SHA-256 for:

- `npm run graph:build`
- `npm run graph:query -- --symbol selectNotificationRoute`
- `npm run graph:path -- --from selectNotificationRoute --to durableQueueRoute`

Capture them with:

- `npm run graph:build > ../evidence/commands/graph-build.txt`
- `npm run graph:query -- --symbol selectNotificationRoute > ../evidence/commands/graph-query.txt`
- `npm run graph:path -- --from selectNotificationRoute --to durableQueueRoute > ../evidence/commands/graph-path.txt`

## verification.md

Record the source SHA, graph regeneration result, Mermaid parser result, semantic edge result, routing test result, stale-claim result, remaining uncertainty, and final conclusion.

## Required Before and After Files

- `evidence/before.md` and `evidence/after.md` record matching session conditions, graph source, unsupported edges, routing results, and changed files.
- `evidence/before.patch` and `evidence/after.patch` are genuine Git diffs for the stale-snapshot and generated-graph attempts.
- `evidence/comparison.md` compares graph accuracy, routing behavior, diagram traceability, and verification.

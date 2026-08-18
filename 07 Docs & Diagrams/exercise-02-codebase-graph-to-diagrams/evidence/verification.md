# Verification

Source SHA: `2ad2e9f2f287ce671e36bcc7b7f68ba12acb1d7a`.

Graph regeneration: `npm run graph:build` at that HEAD produced `artifacts/code-graph.json` with 11 nodes and 9 edges, including `selectNotificationRoute -> hasSmsConsent` (`calls:d718da14f1cb`). Rebuilding in-process matches the committed graph.

Mermaid parser: `npm run diagrams:parse` parsed `diagrams/notification-dependencies.mmd` as `flowchart-v2` and `diagrams/fallback-sequence.mmd` as `sequence` (exit 0).

Semantic edge: `verifyDiagrams` accepts the four unlabeled `ChannelRouter -->` relationships and exactly one `%% EDGE: DEP-01` through `DEP-06` marker in each file. Traceability copies graph edge IDs, source lines, and excerpts from `git show` of the source SHA.

Routing test: `npm run test:routing` passed all six protected cases (exit 0).

Stale claim: STALE-01 and STALE-02 supported; STALE-03 through STALE-06 rejected with graph-edge or Source: evidence in `evidence/stale-claims.md`.

Remaining uncertainty: none material. Sequence case 2 is abbreviated after the unique DEP-06 marker so marker cardinality stays one; the note still states push unavailable, SMS not permitted, email unavailable, and durable queue selected.

Final conclusion: implementation, generated graph, diagrams, tests, and evidence agree at source SHA `2ad2e9f2f287ce671e36bcc7b7f68ba12acb1d7a`.

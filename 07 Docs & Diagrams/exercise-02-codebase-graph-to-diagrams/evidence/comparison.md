# Before and After Comparison

| Measure | Snapshot-led before | Generated-graph after (first attempt) | After specialist review |
| --- | ---: | ---: | ---: |
| Routing tests | 6 of 6, exit 0 | 6 of 6, exit 0 | 6 of 6, exit 0 |
| Mermaid files parsed | not run (forbidden) | 2 of 2, exit 0 | 2 of 2, exit 0 |
| Required DEP markers | 0 of 6 | 6 of 6 in dependency; duplicates in sequence | 6 of 6, one each per diagram |
| Contract aliases | Missing | Present | Present |
| Unsupported snapshot edges drawn | 4 | 0 | 0 |
| Unlabeled verifier relationships | 0 of 4 | 0 of 4 (labeled arrows hidden from regex) | 4 of 4 |
| `selectNotificationRoute -> hasSmsConsent` in graph | not generated | absent pre-fix; present after regen | present (`calls:d718da14f1cb`) |

## Graph Accuracy

The snapshot-led attempt copied all six snapshot claims into diagrams, including four relationships that source and the generated graph reject. The generated-graph attempt queried source calls first, omitted the unsupported consent-on-provider and immediate-to-queue edges, and added the missing router-to-consent call in code.

## Routing Behavior

Both attempts repaired the seeded SMS-without-consent bypass and passed protected routing tests. Routing was not the independent variable; diagram provenance was.

## Diagram Traceability

Only the generated-graph workflow produced contract aliases, DEP markers, and both required sequence cases. Specialist review then fixed unlabeled dependency arrows and duplicate sequence markers so every DEP maps to one generated edge and exact source lines.

## Verification

Final artifacts, hashes, and command captures bind to source SHA `2ad2e9f2f287ce671e36bcc7b7f68ba12acb1d7a`.

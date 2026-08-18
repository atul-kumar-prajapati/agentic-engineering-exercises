# Integration

Prioritisation: verifier-failing diagram encoding first, then provenance write-up, then evidence binding. Routing already matched the contract.

## Dispositions

| Finding | Lane | Decision | Action |
| --- | --- | --- | --- |
| DT-01 labeled arrows | diagram-traceability | fix | Unlabeled `A --> B` arrows matching the four allowed pairs. |
| DT-02/03/04 duplicate markers | diagram-traceability | fix | One `%% EDGE: DEP-0N` per diagram; case 2 kept as a note plus DEP-06. |
| RS-* routing | routing-semantics | accept | No router edit beyond the first attempt. |
| STALE-01, STALE-02 | graph-provenance | accept | Recorded as supported. |
| STALE-03 through STALE-06 | graph-provenance | accept | Recorded as rejected with graph edge or Source: citations. |
| Protected-test AND-order gap | routing-semantics | defer | `run-routing-tests.mjs` is protected; documented only. |
| EI-01 dependency diagram under 240 chars | evidence-integrity | fix | Comment pad in a new source commit; rebind hashes. |

## Rejected

No specialist finding was rejected. Diagram intent from the after attempt was kept; only verifier encoding was corrected.

## Source binding

Implementation and reviewed diagrams were committed as `759cf1efe1aabead32da1ae724d17cb576ba0016`. Evidence-integrity review found the dependency diagram three characters under the submission floor; that comment-only pad is `2ad2e9f2f287ce671e36bcc7b7f68ba12acb1d7a` and is the submitted `source_sha`. Graph JSON, command captures, and remaining evidence are committed after that SHA and may only touch `artifacts/` and `evidence/`.

# Specialist Ownership and Scope

| Specialist | Ownership boundary | Expected output | Verification command | Change permission |
| --- | --- | --- | --- | --- |
| Snapshot-led first-attempt author | Isolated before branch; stale snapshot is the only architecture authority | Genuine first attempt and changed-file list | `npm run test:routing` (optional; no verifier use) | Router plus two before-branch diagrams only |
| Generated-graph first-attempt author | Isolated after branch; generated graph, routing contract, and graph contract are authority | Source-backed first attempt after querying the graph | `npm run graph:query`, `npm run graph:path`, `npm run test:routing`, `npm run diagrams:parse` | Router plus two after-branch diagrams only |
| Routing-semantics reviewer | `selectNotificationRoute` versus `docs/current-routing-contract.md` and protected routing tests | Per-check table with file:line for every defect | `npm run test:routing` | Read-only |
| Diagram-traceability reviewer | Both `.mmd` files, DEP markers, aliases, allowed unlabeled arrows, sequence actors and cases | Per-DEP table and `verifyDiagrams` defects | `npm run diagrams:parse` plus `verifyDiagrams` | Read-only |
| Graph-provenance reviewer | STALE-01–STALE-06 versus generated `calls` edges and source | Supported/rejected table with graph edge or Source: line | `npm run graph:query -- --symbol selectNotificationRoute` | Read-only |
| Evidence-integrity reviewer | Protected inputs, Git ancestry, evidence-only commits after `source_sha`, hashes, submission contract | Hash and binding findings | `npm run test:integrity` and `npm run graph:verify` | Read-only |

The main agent is the accountable integration owner. Review roles do not overlap on the same property of the same artifact. Only the integration owner writes.

# Specialist Ownership and Scope

| Specialist | Ownership boundary | Expected output | Verification command | Change permission |
| --- | --- | --- | --- | --- |
| Document-led first-attempt author | Three temporary diagrams on the isolated before branch; legacy document is the only authority | Genuine first attempt and changed-file list | `git diff --check -- <diagram directory>` | Three before-branch diagram files only |
| Source-led first-attempt author | Three final diagrams; protected implementation and traces are authority | Source-backed first attempt and first-run result | `npm run workflow:trace && npm run diagrams:parse` | Three final diagram files only |
| Workflow provenance reviewer | `WF-01`–`WF-10` transitions, actors, conditions, source markers, and five contradictions | Exact line handoff with accept/fix/defer findings | `npm run workflow:trace` | Read-only |
| Mermaid semantics reviewer | Syntax/type, aliases, conditions, actors, interactions, `alt`/`else`, marker cardinality, unsupported transitions | Diagram-line handoff with accept/fix/defer findings | `npm run diagrams:parse` | Read-only |
| Evidence-integrity reviewer | Protected inputs, Git ancestry, evidence-only commits, hashes, submission contract, and full verification | Contract/hash handoff with accept/fix/defer findings | `npm run verify:exercise` | Read-only |

The main agent is the accountable integration owner. Specialists have no overlapping write ownership; all review roles are read-only.

## Round Two — Independent Re-Audit

Three fresh specialists re-audited the frozen artifacts. Each received a disjoint scope, an explicit instruction that the other two lanes were out of bounds, and its own verification command. All three were read-only.

| Specialist | Ownership boundary | Expected output | Verification command | Change permission |
| --- | --- | --- | --- | --- |
| Round-two workflow provenance auditor | `WF-01`–`WF-10` re-derived from source, contradiction accuracy, unsupported diagram claims | Per-edge and per-contradiction verdict with file:line for every defect | `npm run workflow:trace` | Read-only |
| Round-two Mermaid semantics auditor | Diagram type, state aliases, condition labels, participant aliases, `alt`/`else` structure, marker cardinality, reachability | Per-diagram conformance table and contract-violation list | `npm run diagrams:parse` | Read-only |
| Round-two evidence integrity auditor | Hashes, Git source binding, two-branch proof, submission contract, protected inputs, gates | Hash table, binding findings, process findings, gate exit codes | `npm run test:integrity` and `npm run verify:exercise` | Read-only |

The integration owner alone edited files, chose dispositions, re-captured command evidence, recomputed hashes, and committed. No specialist wrote to the repository, and no two lanes reviewed the same artifact for the same property.


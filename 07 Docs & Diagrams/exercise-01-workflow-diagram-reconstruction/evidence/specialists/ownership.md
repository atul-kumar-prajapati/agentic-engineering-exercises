# Specialist Ownership and Scope

| Specialist | Ownership boundary | Expected output | Verification command | Change permission |
| --- | --- | --- | --- | --- |
| Document-led first-attempt author | Three temporary diagrams on the isolated before branch; legacy document is the only authority | Genuine first attempt and changed-file list | `git diff --check -- <diagram directory>` | Three before-branch diagram files only |
| Source-led first-attempt author | Three final diagrams; protected implementation and traces are authority | Source-backed first attempt and first-run result | `npm run workflow:trace && npm run diagrams:parse` | Three final diagram files only |
| Workflow provenance reviewer | `WF-01`–`WF-10` transitions, actors, conditions, source markers, and five contradictions | Exact line handoff with accept/fix/defer findings | `npm run workflow:trace` | Read-only |
| Mermaid semantics reviewer | Syntax/type, aliases, conditions, actors, interactions, `alt`/`else`, marker cardinality, unsupported transitions | Diagram-line handoff with accept/fix/defer findings | `npm run diagrams:parse` | Read-only |
| Evidence-integrity reviewer | Protected inputs, Git ancestry, evidence-only commits, hashes, submission contract, and full verification | Contract/hash handoff with accept/fix/defer findings | `npm run verify:exercise` | Read-only |

The main agent is the accountable integration owner. Specialists have no overlapping write ownership; all review roles are read-only.

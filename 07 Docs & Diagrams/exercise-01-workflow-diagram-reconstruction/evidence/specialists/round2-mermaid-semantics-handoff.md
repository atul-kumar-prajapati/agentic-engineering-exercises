# Round-Two Mermaid Semantics Handoff

Scope: diagram form and contract conformance only — syntax, type, state aliases, condition labels, participant aliases, `alt`/`else` structure, marker cardinality, reachability. Read-only; no files modified.

Verification: `npm run diagrams:parse` exited `0`; all three diagrams parsed as their expected types.

## Contract Conformance

| Diagram | Type | Aliases | Required structure | Markers |
| --- | --- | --- | --- | --- |
| `access-state.mmd` | `stateDiagram-v2` | all ten contract aliases, exact spelling | `high risk`, `normal risk`, `healthy`, `unhealthy` present; no `failed_provisioning --> provisioning` retry edge; `[*] --> draft`; both terminals reach `[*]` | WF-01…WF-10, one each |
| `access-approval-sequence.mmd` | `sequenceDiagram` | seven allowed participants, all declared and used | `alt High risk` / `else Normal risk` / `end` present and balanced | WF-01…WF-07, one each |
| `access-failure-sequence.mmd` | `sequenceDiagram` | four allowed participants, all declared and used | failure, rollback request, identity-admin removal, rollback completion all present | WF-06, WF-08, WF-09, WF-10, one each |

Zero clauses of `docs/diagram-contract.md`, the evidence template, or the diagram entries of `submission-contract.json` were violated. No invented, misspelled, or hyphenated state alias; no undeclared participant; no orphan or dead-end state; no marker for a non-existent id; no duplicate markers. All three files are ASCII with LF endings.

## Findings

- **Fix in diagram**: `diagrams/access-approval-sequence.mmd` sent `Application->>PolicyEngine: Evaluate request risk` but answered it only inside the `alt High risk` branch. The `else Normal risk` branch contained no PolicyEngine reply, leaving a synchronous call unreturned on that path and the normal-risk routing decision unattributed. No automated check catches this: the semantic verifier inspects participant declarations, the `alt`/`else` headers, and lowercase term presence, never message direction or branch symmetry.
- **Accept, no change**: `access-approval-sequence.mmd` draws `WF-04` as `DataOwner->>Application` while the high-risk branch draws `Application->>DataOwner` under `WF-05`. These are two different transitions, and the file consistently places the transition's traced actor as the sender of the first message under each marker, so the direction is correct as written.
- **Note only**: `access-failure-sequence.mmd` satisfies the `failed` and `rollback request` submission-contract strings only through the shared verifier's case-insensitive comparison. It is not a violation under the contract's actual semantics, but it is the one place compliance rests on verifier leniency.

## Integration Disposition

A `PolicyEngine-->>Application: Normal risk needs no security review` reply was added to the `else Normal risk` branch, placed before the `%% EDGE: WF-04` marker so the actor-as-sender convention and the marker cardinality are both preserved. The WF-04 arrow direction was left unchanged on the reviewer's own accept. The case-sensitivity note was accepted as informational; no protected input was touched.

# Diagram Traceability Handoff

Reviewer: read-only specialist on the generated-graph first attempt.
Command: `npm run diagrams:parse` (exit 0). Semantic checks from `verifyDiagrams` failed.

## Verdict

FAIL on the unaided first attempt. Parser success is not semantic success.

## Findings

| ID | Finding | file:line | Disposition | Reason |
| --- | --- | --- | --- | --- |
| DT-01 | Labeled `--> \|callee\|` arrows are invisible to `/^\s*(\w+)\s*-->\s*(\w+)\s*$/` | `notification-dependencies.mmd:8,10,12,14,16,18` | fix | Verifier would report all four allowed relationships missing. Integration owner rewrote unlabeled `ChannelRouter --> ProviderStatus\|ConsentPolicy\|ImmediateRoute\|DurableQueue`. |
| DT-02 | Duplicate `%% EDGE: DEP-01` | `fallback-sequence.mmd:28` | fix | Marker count must be 1 per diagram. Case 2 note kept; second DEP-01 removed. |
| DT-03 | Duplicate `%% EDGE: DEP-02` | `fallback-sequence.mmd:31` | fix | Same cardinality rule. |
| DT-04 | Duplicate `%% EDGE: DEP-04` | `fallback-sequence.mmd:34` | fix | Same cardinality rule. |
| DT-05 | Aliases, actors, and required phrases present | both diagrams | accept | Independent of the regex/marker defects. |

Rejected findings: none. The first-attempt relationship *intent* (ChannelRouter to the four aliases, DEP-03 present) was correct; only encoding failed the verifier.

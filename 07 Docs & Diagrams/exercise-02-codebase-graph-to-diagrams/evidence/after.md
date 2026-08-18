# Generated-Graph First Attempt

## Session Conditions

- Starting commit: `3761a42840cbbc4ee9143ecc914519b4f8c6cc0c`, identical to the before attempt
- Final source SHA: `2ad2e9f2f287ce671e36bcc7b7f68ba12acb1d7a`
- Branch: `codex/exercise-07-02-codebase-graph-to-diagrams`
- Input: the same routing-and-diagrams task, plus the generated discovery graph, `docs/current-routing-contract.md`, and `docs/graph-contract.md` instead of the stale snapshot
- Agent conditions: fresh Cursor subagent, inherited model, standard workspace tools and permissions, one first attempt, no corrections, retries, or verifier-guided revision
- Time limit: 45 minutes; the attempt completed within the limit

## Graph Source

The after agent queried `selectNotificationRoute` and the path to `durableQueueRoute` on the generated graph **before** editing code. Pre-fix outgoing calls were `pushAvailable`, `smsAvailable`, `emailAvailable`, `immediateRoute`, and `durableQueueRoute`. `hasSmsConsent` was absent as a callee, which is the seeded consent bypass.

## Result

Changed files: `notification-mesh-app/src/notification/routeNotification.mjs`, `diagrams/notification-dependencies.mmd`, and `diagrams/fallback-sequence.mmd`.

Routing results: `npm run test:routing` passed with exit code `0`. `npm run diagrams:parse` passed with exit code `0` (flowchart-v2 and sequence). Independent semantic review then found verifier defects the parser does not catch.

## Unsupported Edges

Unsupported or unverifiable first-attempt diagram relationships: **4 missing unlabeled dependency arrows** (the six labeled `--> |callee|` edges do not match the verifier's unlabeled `A --> B` regex) and **3 duplicate sequence markers** (`DEP-01`, `DEP-02`, and `DEP-04` were repeated in case 2).

The first attempt used the correct aliases and both required sequence cases. It did not copy the stale `smsAvailable -> hasSmsConsent` or `immediateRoute -> durableQueueRoute` claims.

## Preservation

`evidence/after.patch` is the genuine uncommitted Git diff of the generated-graph first attempt. The routing change from that attempt was committed without revision. Specialist review corrected unlabeled arrows and duplicate markers in `759cf1efe1aabead32da1ae724d17cb576ba0016`. Evidence-integrity review then required a submission-contract size comment on the dependency diagram, committed as `2ad2e9f2f287ce671e36bcc7b7f68ba12acb1d7a` (the submitted `source_sha`). `after.patch` remains the unaided attempt.

## Post-Review Correction

- Dependency diagram: drop edge labels so `ChannelRouter --> ProviderStatus|ConsentPolicy|ImmediateRoute|DurableQueue` are visible to the verifier regex; keep one `%% EDGE: DEP-0N` per required call.
- Sequence diagram: keep both fallback cases but emit each `%% EDGE: DEP-0N` marker exactly once.

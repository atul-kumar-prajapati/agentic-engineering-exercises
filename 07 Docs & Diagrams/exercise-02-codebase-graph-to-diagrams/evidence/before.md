# Snapshot-Led First Attempt

## Session Conditions

- Starting commit: `3761a42840cbbc4ee9143ecc914519b4f8c6cc0c`
- Branch: `codex/exercise-07-02-codebase-graph-to-diagrams-before`
- Input: only `docs/graph-snapshot.md` plus the mission to repair SMS consent bypass and produce dependency and fallback-sequence Mermaid diagrams
- Agent conditions: fresh Cursor subagent, inherited model, standard workspace tools and permissions, one first attempt, no hints, corrections, retries, graph-contract, routing-contract, graph builder, or verifier-guided revision
- Time limit: 45 minutes; the attempt completed within the limit

## Graph Source

The stale snapshot was the only architecture authority. `npm run graph:build` was not used.

## Result

Changed files: `notification-mesh-app/src/notification/routeNotification.mjs`, `diagrams/notification-dependencies.mmd`, and `diagrams/fallback-sequence.mmd`.

Routing results: `npm run test:routing` passed with exit code `0` (push primary, consented SMS, email fallback, durable queue). The routing fix itself was correct; the diagrams were not.

## Unsupported Edges

Unsupported snapshot relationships drawn into the diagrams: **4**.

1. `selectNotificationRoute -->|"every available provider"| immediateRoute`
2. `smsAvailable --> hasSmsConsent`
3. `emailAvailable --> hasSmsConsent`
4. `immediateRoute -->|"after provider failure"| durableQueueRoute`

The dependency diagram used `flowchart TD` and snapshot function names instead of the contract aliases. The sequence diagram used snapshot callees as participants and omitted `Client`, `ChannelRouter`, `ProviderStatus`, `ConsentPolicy`, and `RouteResult`. Required `%% EDGE: DEP-01` through `DEP-06` markers were absent.

## Preservation

`evidence/before.patch` is the genuine Git diff of the snapshot-led first attempt, also committed as `73eae2910277a973b969467d3d290759bcdb924a` on `codex/exercise-07-02-codebase-graph-to-diagrams-before`. No corrections were requested from the snapshot-led agent.

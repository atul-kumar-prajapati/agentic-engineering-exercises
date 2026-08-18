# Graph Provenance Handoff

Reviewer: read-only specialist. Command: `npm run graph:query -- --symbol selectNotificationRoute` against the unfixed discovery graph, then reasoned from the fixed router.

## Verdict

2 supported, 4 rejected. Matches snapshot order.

## Findings

| ID | Finding | Evidence | Disposition | Reason |
| --- | --- | --- | --- | --- |
| STALE-01 | `selectNotificationRoute -> pushAvailable` | graph edge `calls:b4ecdcb068fb`; Source: `routeNotification.mjs:7` | accept as supported | Direct imported call. |
| STALE-02 | `selectNotificationRoute -> smsAvailable` | graph edge `calls:f625212c18d7`; Source: `routeNotification.mjs:8` | accept as supported | Direct imported call; consent is a sibling. |
| STALE-03 | `immediateRoute` for every available provider | graph edge `calls:8aa0cc10c4a0` exists but the quantifier is false | accept as rejected | One merged calls edge; first permitted channel wins. |
| STALE-04 | `smsAvailable -> hasSmsConsent` | no calls edge; Source: `channelProviders.mjs:5-7` | accept as rejected | Import ≠ calls. Real edge is router → `hasSmsConsent`. |
| STALE-05 | `emailAvailable -> hasSmsConsent` | no calls edge; Source: `channelProviders.mjs:9-11` | accept as rejected | Email never reads consent. |
| STALE-06 | `immediateRoute -> durableQueueRoute` after failure | no calls edge; Source: `routeResults.mjs:1-3` | accept as rejected | Queue is router → `durableQueueRoute` when no permitted channel. |

Rejected findings: none. The trap of treating DEP-05 or DEP-06 as support for STALE-03/STALE-06 was noted and avoided.

# Code Graph and Diagram Contract

Generate the graph from `notification-mesh-app/src/notification/**/*.mjs` with the supplied builder. Do not edit the generated JSON by hand.

The dependency diagram starts with `flowchart LR` and uses these aliases: `ChannelRouter`, `ProviderStatus`, `ConsentPolicy`, `ImmediateRoute`, and `DurableQueue`. It must show only the four supported component dependencies. Labels may group the provider-status and immediate-route calls.

The sequence diagram starts with `sequenceDiagram` and uses `Client`, `ChannelRouter`, `ProviderStatus`, `ConsentPolicy`, and `RouteResult`. Show two cases:

- Push unavailable, SMS available but not consented, then email selected.
- Push unavailable, SMS not permitted, email unavailable, then durable queue selected.

In the sequence diagram, add `%% EDGE: DEP-<number>` immediately before the message that represents that exact call. The required mappings are:

| ID | Caller | Callee | Required diagrams |
| --- | --- | --- | --- |
| DEP-01 | `selectNotificationRoute` | `pushAvailable` | sequence |
| DEP-02 | `selectNotificationRoute` | `smsAvailable` | sequence |
| DEP-03 | `selectNotificationRoute` | `hasSmsConsent` | sequence |
| DEP-04 | `selectNotificationRoute` | `emailAvailable` | sequence |
| DEP-05 | `selectNotificationRoute` | `immediateRoute` | sequence |
| DEP-06 | `selectNotificationRoute` | `durableQueueRoute` | sequence |

The generated graph provides call-level traceability for both diagrams. Source remains the authority for behavior and branch order. `npm run graph:build` creates the committed artifact; final verification uses `npm run graph:build:check` to rebuild it in a temporary path without rewriting the submission.

# Code Graph and Diagram Contract

Generate the graph from `notification-mesh-app/src/notification/**/*.mjs` with the supplied builder. Do not edit the generated JSON by hand.

The dependency diagram starts with `flowchart LR` and uses these aliases: `ChannelRouter`, `ProviderStatus`, `ConsentPolicy`, `ImmediateRoute`, and `DurableQueue`. It must show only the six required call relationships.

The sequence diagram starts with `sequenceDiagram` and uses `Client`, `ChannelRouter`, `ProviderStatus`, `ConsentPolicy`, and `RouteResult`. Show two cases:

- Push unavailable, SMS available but not consented, then email selected.
- Push unavailable, SMS not permitted, email unavailable, then durable queue selected.

Add `%% EDGE: DEP-<number>` immediately before each represented relationship. The required mappings are:

| ID | Caller | Callee | Required diagrams |
| --- | --- | --- | --- |
| DEP-01 | `selectNotificationRoute` | `pushAvailable` | dependency, sequence |
| DEP-02 | `selectNotificationRoute` | `smsAvailable` | dependency, sequence |
| DEP-03 | `selectNotificationRoute` | `hasSmsConsent` | dependency, sequence |
| DEP-04 | `selectNotificationRoute` | `emailAvailable` | dependency, sequence |
| DEP-05 | `selectNotificationRoute` | `immediateRoute` | dependency, sequence |
| DEP-06 | `selectNotificationRoute` | `durableQueueRoute` | dependency, sequence |

The generated graph is the machine-readable dependency record. Source remains the authority for behavior and branch order.

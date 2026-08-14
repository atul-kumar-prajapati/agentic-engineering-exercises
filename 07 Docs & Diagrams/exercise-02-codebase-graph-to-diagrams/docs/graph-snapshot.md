# Stale Notification Graph Snapshot

This snapshot predates the current routing contract. Treat every relationship as an unverified claim.

- `selectNotificationRoute -> pushAvailable`
- `selectNotificationRoute -> smsAvailable`
- `selectNotificationRoute -> immediateRoute` for every available provider
- `smsAvailable -> hasSmsConsent`
- `emailAvailable -> hasSmsConsent`
- `immediateRoute -> durableQueueRoute` after provider failure

Some entries are accurate, some assign responsibility to the wrong component, and some do not exist in source.

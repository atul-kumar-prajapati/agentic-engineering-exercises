# Stale Snapshot Claim Review

Claims are listed in snapshot order. Each decision cites a generated graph edge or Source: path.

## STALE-01

Result: supported

Claim: `selectNotificationRoute -> pushAvailable`.

Graph edge `calls:b4ecdcb068fb` records this exact call at Source: `src/notification/routeNotification.mjs:7`. The fixed router still checks `pushAvailable(input)` first and returns `immediateRoute("push")` when the provider is healthy. This relationship exists in the generated graph and in committed source.

## STALE-02

Result: supported

Claim: `selectNotificationRoute -> smsAvailable`.

Graph edge `calls:f625212c18d7` records this call at Source: `src/notification/routeNotification.mjs:8`. The consent check is a sibling call on the same line; it does not replace the SMS availability probe. The generated graph keeps this edge after the fix.

## STALE-03

Result: rejected

Claim: `selectNotificationRoute -> immediateRoute` for every available provider.

Graph edge `calls:8aa0cc10c4a0` does show `selectNotificationRoute` calling `immediateRoute` at Source: `src/notification/routeNotification.mjs:7,8,9`. That supports DEP-05, not the quantifier. The router returns from the first permitted channel, so multiple healthy providers still produce one immediate route. SMS also requires `hasSmsConsent`; availability alone does not select SMS.

## STALE-04

Result: rejected

Claim: `smsAvailable -> hasSmsConsent`.

No generated `calls` edge exists between those functions. Source: `src/notification/channelProviders.mjs:5-7` shows `smsAvailable` only reading `input.smsAvailable`. Consent is checked by the router: graph edge `calls:d718da14f1cb` is `selectNotificationRoute -> hasSmsConsent` at Source: `src/notification/routeNotification.mjs:8`. An import of `hasSmsConsent` is not a calls edge from `smsAvailable`.

## STALE-05

Result: rejected

Claim: `emailAvailable -> hasSmsConsent`.

No generated graph edge connects these functions. Source: `src/notification/channelProviders.mjs:9-11` shows `emailAvailable` only reading `input.emailAvailable`. Email fallback never consults SMS consent. The real email relationship is graph edge `calls:e5c1d2e5d3ed` (`selectNotificationRoute -> emailAvailable`).

## STALE-06

Result: rejected

Claim: `immediateRoute -> durableQueueRoute` after provider failure.

No generated `calls` edge exists from `immediateRoute` to `durableQueueRoute`. Source: `src/notification/routeResults.mjs:1-3` shows `immediateRoute` returning `{ channel, durable: false }` with no further calls. The durable queue is selected by the router when no permitted immediate channel exists: graph edge `calls:f5fd28b7fb8e` at Source: `src/notification/routeNotification.mjs:10`. That is not a post-failure handoff from an immediate route.

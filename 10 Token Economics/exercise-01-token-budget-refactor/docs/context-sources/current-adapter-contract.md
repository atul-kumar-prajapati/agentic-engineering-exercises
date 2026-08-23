# Current Session Adapter Contract

`adaptSession(input)` accepts the current session payload and returns `{ userId, roles, expiresAt }`. Unknown input fields are ignored. Roles preserve input order and duplicates are removed by first occurrence.

Missing `userId` is rejected before role normalization. An empty roles array is valid. `expiresAt` must remain an ISO-8601 string because callers compare the serialized value and forward it to the audit service.

`userId` and every role must be non-empty strings. `roles` must be an array. `expiresAt` must parse as an ISO-8601 timestamp. Invalid input throws synchronously with a field-specific error.

The adapter is a compatibility boundary. Refactoring may extract helpers, but the exported name, synchronous behavior, field names, validation order, and returned value must not change.

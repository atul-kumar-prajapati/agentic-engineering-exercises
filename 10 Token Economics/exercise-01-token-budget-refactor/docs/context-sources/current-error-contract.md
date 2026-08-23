# Current Adapter Error Contract

Invalid payloads throw `SessionAdapterError`. Missing identity uses code `SESSION_USER_REQUIRED` and message `Session userId is required`. Invalid expiry uses code `SESSION_EXPIRY_INVALID` and message `Session expiresAt must be an ISO timestamp`. Invalid roles use code `SESSION_ROLES_INVALID` and message `Session roles must be an array of non-empty strings`.

Validation order is identity, expiry, then roles. Monitoring groups failures by code, while API contract tests assert the exact public message.

# Legacy Migration Notes

Status: superseded. These notes describe the removed v1 adapter.

The old migration temporarily renamed `userId` to `subject`, sorted roles alphabetically, returned epoch seconds for expiry, and converted validation failures to `LegacySessionError`. Those rules must not be applied to the current adapter.

This file remains only to explain historical commits and old incident reports.

# Before and After Comparison

## Evidence limitation

A genuine implementation-producing run without Superpowers was not performed before this session. The earlier task installed and then removed the global plugin but did not implement the feature. Consequently, no honest `before.patch` exists, and identical agent, model, tools, permissions, and first-attempt conditions cannot be established for a fair experimental comparison. This document does not reconstruct or invent missing behavior.

## Observable Superpowers-driven behavior

The after run used the repository-local skills and left chronological Git checkpoints for approved design, implementation plan, failing tests, production code, review fixes, and verification.

| Risk or workflow area | Missing pre-run evidence | Observable after-run behavior |
| --- | --- | --- |
| Authorization and workspace policy | No implementation is available for comparison. | `superpowers:brainstorming` extracted active-status and `inviteRoles` requirements; tests cover owners, admins, excluded admins, members, and suspended actors. |
| Case-insensitive duplicate email handling | No implementation is available for comparison. | The design required normalization before comparisons; tests cover existing members, pending invitations, and expired replacements. |
| Guest policy | No implementation is available for comparison. | The service rejects guests while disabled and preserves guest role when acceptance is permitted. |
| Expiry | No implementation is available for comparison. | The plan specified configured UTC expiry and the equality boundary; tests reject `expiresAt <= now`. |
| Single-use acceptance and revocation | No implementation is available for comparison. | Accepted and revoked invitations are final, repeated actions fail, and direct accepted-revocation coverage was added during review. |
| Rejected-state safety | No implementation is available for comparison. | TDD and review require both unchanged values and original state-object identity for rejected actions. |
| Planning quality | No pre-run plan exists. | Approved design commit `f51536d` precedes executable plan commit `9eb59af`, which precedes tests and code. |
| Tests and verification | No pre-run test record exists. | `superpowers:test-driven-development` recorded Red before Green; independent review and final commands provide separate gates. |

The after run demonstrates how specific Superpowers skills shaped the work, but it cannot prove a causal before/after improvement without the missing controlled pre-Superpowers implementation run.

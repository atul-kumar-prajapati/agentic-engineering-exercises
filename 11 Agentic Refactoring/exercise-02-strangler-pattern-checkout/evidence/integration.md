# Integration

Parent: Cursor Grok 4.6. First-attempt and specialist model: `cursor-grok-4.6-high`.

## Prioritisation

1. Do not rewrite a passing after implementation to look more different from before.
2. Keep `sourceSha` as the unaided after commit (`58878e4215a164c7a445bd4399118625e894d5e3`) so `after.patch` stays byte-identical to `git diff --binary --full-index 52090ed 58878e42`.
3. Record every dismissed specialist claim.

## Disposition

No specialist finding was accepted for a code change. Route-boundary RB-1..RB-4 dismissed (call vectors vs payloads, declined coverage in protected fixtures, exact `=== "card"`, before extras). Authorization-safety dismissals recorded in that handoff (string throw fail-closed, no retag after authorize, strict `=== false`). Evidence-integrity confirmed the three-file rule and a non-cycle SHA binding.

Rejected the idea of degrading the before baseline. Both attempts passed `test:checkout`. The independent variable is the contract input plus Git binding, not routing quality. The remaining before risk (retagging non-object `authorize` throws as `authorizationCreated: false`) is documented in `comparison.md`; after does not have it.

## Submitted blobs

Fast-forward `/tmp/ex-11-02` to `58878e42`. No integration edit to `cardCheckout.mjs`, `checkoutRouter.mjs`, or `checkoutRouter.test.mjs`.

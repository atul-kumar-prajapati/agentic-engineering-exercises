# Evidence-integrity handoff

Reviewer: cursor-grok-4.6-high. Artifact: after commit `58878e4215a164c7a445bd4399118625e894d5e3` and verifier `strangler-verification.mjs` (protected, same as `52090ed`).

Verdict: PASS. No accepted defects.

| Check | disposition | file:line | Result |
|---|---|---|---|
| Three-file `diff-tree` | accept as confirmed | `strangler-verification.mjs:11-17` | Exactly `cardCheckout.mjs`, `checkoutRouter.mjs`, `checkoutRouter.test.mjs` |
| Ancestor | accept as confirmed | `strangler-verification.mjs:9` | `58878e42` is ancestor of the exercise branch after fast-forward |
| Protected diffs vs `52090ed` | accept as confirmed | `challenge-integrity.json:3-19` | All 16 protected paths empty, including `legacyCheckout.mjs` |
| Size floors | accept as confirmed | `cardCheckout.mjs` 1181 chars; `checkoutRouter.test.mjs` 5670 chars | Required substrings present |
| Hash cycle | dismiss as cycle | `verify-strangler-submission.mjs:18-20` | `history.json` records `sourceSha` in a later `evidence/` commit. Not a 7.2-style self-hash |

`58878e42` can be (and is) `sourceSha`. Fast-forward kept that object id. Later commits may only add `…/evidence/`.

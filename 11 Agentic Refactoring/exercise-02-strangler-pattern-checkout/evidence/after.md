# After run — contract-backed card-only strangler

- Starting commit: `52090edddf032d026ece16ef90feb627bf8e67ac`
- Implementation commit: `58878e4215a164c7a445bd4399118625e894d5e3`
- Agent and model: cursor / cursor-grok-4.6-high
- Tools and permissions: Cursor agent, isolated git worktree `/tmp/ex-11-02-after`, npm inside `checkout-strangler-app`, no extra secrets, first attempt
- Time limit: 45 minutes
- Human hints: 0
- Retries: 0
- Patch path: `evidence/after.patch`
- Patch SHA-256: `694b556fe7b3e7ea5c6543ca768c096c6a02932de17d8c086aea95767d6b4566`
- Checkout check exit code: 0 (`npm run test:checkout` on the after implementation, re-run by the integration owner)

The after run received the repo contracts only. It did not receive the previous implementation, before.patch, or any explanation of the first attempt.

`after.patch` is the unaided after diff. The exercise branch fast-forwarded to the same commit, so `sourceSha` `58878e4215a164c7a445bd4399118625e894d5e3` and the after implementation commit are the same object. Blobs: `cardCheckout.mjs` `b2b87bf54c6bb5efe15e8d4e03eafc302ba352ea`, `checkoutRouter.mjs` `b350b5e8c4b362593ae2d14c4c448140376b49cb`, `checkoutRouter.test.mjs` `1597cc9488931e73076c02250ce6fcbb5b1a9d2e`.

## Public-contract differences

None. Protected characterization in `run-checkout-tests.mjs` compared the card slice to legacy for both fixtures and matched `docs/checkout-cases.json`.

## New-slice calls / legacy calls

Re-derived from `run-checkout-tests.mjs` against this implementation (exit 0):

| Route | card calls | legacy calls |
|---|---|---|
| card, flag on | `["card"]` | `[]` |
| gift-card | `[]` | `["gift-card"]` |
| invoice | `[]` | `["invoice"]` |
| unknown (`crypto`) | `[]` | `["crypto"]` |
| card, flag off | `[]` | `["card"]` |
| pre-authorization `{ authorizationCreated: false }` | `["card"]` | `["card"]` |
| unsafe (`true`, missing flag, `Error`) | `["card"]` | `[]` |

## Duplicate-authorization risk

Untagged throws after the card slice has run do not call legacy (`checkoutRouter.mjs:35-41`). `createCardCheckout` does not rewrite failures as `authorizationCreated: false`.

## Files changed / lines

3 files, 259 insertions, 2 deletions:

- `cardCheckout.mjs` 32 / 0
- `checkoutRouter.mjs` 41 / 2
- `checkoutRouter.test.mjs` 186 / 0

# Route matrix

Citation tree: learner files are source commit `58878e4215a164c7a445bd4399118625e894d5e3` (working tree identical). Protected routes are `checkout-strangler-app/scripts/run-checkout-tests.mjs` on that same tree, byte-identical to `upstream/main` `52090edddf032d026ece16ef90feb627bf8e67ac`. There is no review bundle; line numbers below were re-counted against those files.

| Payment type | Flag | Destination | card calls | legacy calls | Proof |
|---|---|---|---|---|---|
| card | on | new slice | `["card"]` | `[]` | `checkoutRouter.mjs:5-6,28-33`; `run-checkout-tests.mjs:45-47`; `checkoutRouter.test.mjs:39-60` |
| gift-card | on or off | legacy | `[]` | `["gift-card"]` | `checkoutRouter.mjs:6,28-29`; `run-checkout-tests.mjs:49-52`; `checkoutRouter.test.mjs:62-70` |
| invoice | on or off | legacy | `[]` | `["invoice"]` | same loop `run-checkout-tests.mjs:49-52`; `checkoutRouter.test.mjs:73-81` |
| unknown (`crypto`) | on or off | legacy | `[]` | `["crypto"]` | `docs/checkout-contract.md:13`; `run-checkout-tests.mjs:49-52`; `checkoutRouter.test.mjs:84-92` |
| card | flag off | legacy | `[]` | `["card"]` | `checkoutRouter.mjs:6` requires `cardSliceEnabled === true`; `run-checkout-tests.mjs:55-58`; `checkoutRouter.test.mjs:95-103` |
| card | on, pre-authorization failure | new slice then legacy once | `["card"]` | `["card"]` | `checkoutRouter.mjs:35-36`; `run-checkout-tests.mjs:60-62`; `checkoutRouter.test.mjs:106-119` |
| card | on, ambiguous / completed auth | new slice only | `["card"]` | `[]` | `checkoutRouter.mjs:35-41`; `run-checkout-tests.mjs:64-73` (three shapes); `checkoutRouter.test.mjs:121-174` |

`run-checkout-tests.mjs:76` prints “8 protected strangler route checks”. Re-counting the file gives **2** fixture characterizations (`:13-30`) plus **9** routing behaviors: enabled card, gift-card, invoice, crypto, flag off, pre-authorization fallback, and three unsafe throws. This matrix uses the re-derived 9, not the log’s “8”.

Rollback remains `cardSliceEnabled: false` plus the still-injected legacy function. The new slice is never the only callable path.

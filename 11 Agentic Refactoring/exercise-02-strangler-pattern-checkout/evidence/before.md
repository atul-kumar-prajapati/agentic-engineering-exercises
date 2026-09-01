# Before run — unconstrained card extraction

- Starting commit: `52090edddf032d026ece16ef90feb627bf8e67ac`
- Implementation commit: `f2f3646c5f104576294b0513538381ba1a75736f`
- Agent and model: cursor / cursor-grok-4.6-high
- Tools and permissions: Cursor agent, isolated git worktree `/tmp/ex-11-02-before`, npm inside `checkout-strangler-app`, no extra secrets, first attempt
- Time limit: 45 minutes
- Human hints: 0
- Retries: 0
- Patch path: `evidence/before.patch`
- Patch SHA-256: `a15e9f3d20f132e54f28346915d3be34edba30a1b311112e08551a70ca42c4f5`
- Checkout check exit code: 0 (`npm run test:checkout` on the before implementation)

The prompt withheld the route contract, README, `docs/checkout-contract.md`, and verifier scripts. The agent still produced a three-file strangler (router, `cardCheckout.mjs`, participant tests) and `test:checkout` exited 0. That is a too-good baseline, not a problem to fix.

## Public-contract differences

None against the two protected fixtures. Approved `1001` / `825` bps stayed `1084`; declined `4200` / `500` bps stayed `4410` with `PAYMENT_DECLINED`.

## New-slice calls / legacy calls

On the protected matrix the before router already sent enabled card to the new slice (`legacy: []`, `card: ["card"]`) and gift-card, invoice, crypto, and flag-off card to legacy only. Safe `{ authorizationCreated: false }` fell back once. Unsafe throws did not call legacy.

## Duplicate-authorization risk

Present on an untagged non-object `authorize` throw. `cardCheckout.mjs` wraps a non-object failure as `{ authorizationCreated: false, result }`, so the router may call legacy after `authorize` already ran. Protected tests do not cover that shape; they inject throws at `implementations.card`.

## Files changed / lines

3 files, 175 insertions, 2 deletions (`git diff --numstat` from the starting commit):

- `cardCheckout.mjs` 61 / 0
- `checkoutRouter.mjs` 38 / 2
- `checkoutRouter.test.mjs` 76 / 0

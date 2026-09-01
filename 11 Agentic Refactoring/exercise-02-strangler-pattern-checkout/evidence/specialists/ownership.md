# Specialist ownership

Parent: Cursor Grok 4.6 (integration owner, only writer).
Reviewers and first-attempt agents: `cursor-grok-4.6-high`.

| Lane | Owner | Scope | Out of bounds | Verification | Write permission | Output |
|---|---|---|---|---|---|---|
| Unconstrained before | first-attempt agent | implement without the route contract in `/tmp/ex-11-02-before` | after worktree, evidence, protected files | `npm run test:checkout` | write only on `-before` | commit `f2f3646c5f104576294b0513538381ba1a75736f` |
| Contract-backed after | first-attempt agent | three-file strangler in `/tmp/ex-11-02-after` | before worktree, `before.patch`, evidence | `npm run test:checkout` | write only on `-after` | commit `58878e4215a164c7a445bd4399118625e894d5e3` |
| Route boundary | read-only specialist | card vs gift-card vs invoice vs unknown vs flag-off; rounding | fallback, Git history | `npm run test:checkout` | none | verdict + table |
| Authorization safety | read-only specialist | `authorizationCreated`, authorize-once, no duplicate legacy | happy-path type routing, Git history | `npm run test:checkout` | none | verdict + table |
| Evidence integrity | read-only specialist | `sourceSha` three-file rule, protected-path empty diff, hash-cycle probe | routing semantics | git diff-tree / diff | none | verdict + table |

Lanes were parallel. Reviewers were instructed to find something wrong. A round with zero accepted defects is only a review because dismissed claims are recorded in the handoffs.

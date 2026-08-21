# Behavior lane handoff

Reviewer: [Behavior-preservation specialist](70bacb51-3b8d-4203-94b5-cb20093170eb), model `cursor-grok-4.6-high`, read-only. Integration owner re-ran a seven-case import probe on the after helper and `run-migration-tests.mjs` on both the seeded copy (exit 1) and the submitted helper (exit 0) before accepting.

Authoritative artifacts: after/source `exportButton.mjs` blob `f2da70a67c627c3bbd4033c5ccfbc58c3ae3da92`; protected `scripts/run-migration-tests.mjs` as checked in (no bundle; same file on `upstream/main`).

Case count re-derived: 4 brief behaviors (export, checkout, delete, unknown) plus 3 protected-loop-only actions on `run-migration-tests.mjs:7` (`archive`, `save`, `""`) = **7** unique cases. `unknown` appears in both lists once.

| Case | Expected | Actual | file:line | disposition |
|---|---|---|---|---|
| export | ds-secondary | ds-secondary | `exportButton.mjs:2` | **accept** pass |
| checkout | legacy-primary | legacy-primary | `exportButton.mjs:4` fallback | **accept** pass |
| delete | legacy-danger | legacy-danger | `exportButton.mjs:3` | **accept** pass |
| unknown | legacy-primary | legacy-primary | `exportButton.mjs:4` | **accept** pass |
| archive | legacy-primary | legacy-primary | `exportButton.mjs:4` | **accept** pass |
| save | legacy-primary | legacy-primary | `exportButton.mjs:4` | **accept** pass |
| empty string | legacy-primary | legacy-primary | `exportButton.mjs:4` | **accept** pass |

Dismissed: learner test omits archive, save, and empty string. Not a helper defect; `run-migration-tests.mjs:7` covers those three. Checkout has no dedicated `if`; the contract requires the return value, which the fallback provides.

No helper edits from this lane.

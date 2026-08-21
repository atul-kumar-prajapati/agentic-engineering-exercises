# Integration

Parent: Cursor Grok 4.6. Specialists and first-attempt subagents: `cursor-grok-4.6-high`. Reported is not proven; every accepted count and every behavior case was re-derived on the worktrees before the source commit.

## Priority

1. Protected behavior (export / checkout / delete / unknown plus the protected loop).
2. Git path and line budget on the source commit.
3. Plan-before-code ancestry.
4. Unrelated cleanup claims that would change the unaided after blob.

## Disposition

- **S-01 (restore seeded JSDoc)** — rejected. The scope lane is right that the after helper's only deletion is the comment at seeded `exportButton.mjs:1`. The exercise's excluded cleanup is shared components, styles, packages, and unrelated call sites (`docs/scope-contract.md`, plan `excludedPaths`). The comment claimed export had not crossed the design-system boundary; after `exportButton.mjs:2` that sentence is false. Shipping a stale claim to make numstat `1 0` instead of `1 1` would shape content around the checker. Submitted helper blob `f2da70a67c627c3bbd4033c5ccfbc58c3ae3da92` matches the unaided after file.
- **S-02 (before JSDoc rewrite)** — accepted as a frozen baseline finding. `before.patch` is not edited.
- **Behavior 7/7** — accepted after an independent import probe printed matching actuals for export, checkout, delete, unknown, archive, save, and empty string. Protected test vs seeded helper: exit 1 at `run-migration-tests.mjs:4` (export still `legacy-primary`). Protected test vs submitted helper: exit 0.
- **Evidence-integrity clean verdict** — accepted after re-running `diff-tree` on `c035329dd23f040f3afd55e1ffd56e9c3904729b` and `show --numstat` on `71703feac67672c41321f517effd752ef60d0493` (2 files, 39+, 1−, 40 changed).
- **Learner test omits archive/save/empty** — deferred as extra learner coverage, not a required helper defect. Protected loop at `run-migration-tests.mjs:7` remains the gate.

No source edits after `sourceSha`. `after.patch` remains the unaided attempt; integration did not move the helper or test blobs.

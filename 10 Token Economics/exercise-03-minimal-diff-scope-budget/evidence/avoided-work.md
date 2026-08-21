# Avoided work

The production request is one mapping: `buttonVariantFor("export")` returns `ds-secondary`. Everything else in this app is either a protected legacy contract or lab chrome that does not participate in that mapping. This record is the reason those surfaces were left unchanged.

## Checkout

Checkout is outside the migration slice. `buttonVariantFor("checkout")` must keep returning `legacy-primary`. That value is the helper's default branch, not a dedicated `if`. Changing checkout to a design-system token, or adding a checkout-specific branch, would be new behavior the request does not name. The protected assert in `scripts/run-migration-tests.mjs:5` and the learner test `givenCheckoutAction_whenButtonVariantIsResolved_thenReturnsLegacyPrimary` both lock this.

## Destructive delete

Delete is the one existing special case: `legacy-danger`. The source commit does not rewrite that guard. A shared "migrate every legacy variant" cleanup would have replaced it and failed `run-migration-tests.mjs:6`. Destructive behavior stays on the seeded path because the request is export-only.

## Shared components

`src/components/` (`DecisionLog`, `EvidenceLedger`, `SkillPatternBoard`) render the lab contract. None of them call `buttonVariantFor`. Editing them would expand the review surface and the token budget without moving export onto `ds-secondary`. They are listed in the pre-change plan's excluded paths for that reason.

## Styles

`src/styles.css` styles the lab shell. The helper returns variant *names*; it does not emit CSS classes into the page. Restyling `.work-card` or adding a `.ds-secondary` rule would be visual cleanup adjacent to the request, not the mapping. Styles stay untouched.

## Unrelated cleanup

No `package.json` dependency is required for one equality check. `src/App.tsx`, `src/skillWorkflow.ts`, and `src/labContract.ts` are lab chrome. Archive, save, unknown, and empty-string actions keep falling through to `legacy-primary`. The reason is the same in each case: the request, not nearby files, defines scope.

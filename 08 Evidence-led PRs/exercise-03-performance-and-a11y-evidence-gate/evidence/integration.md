# Integration

Prioritisation: keep the two seeded UI defects fixed, keep the gate digest-bound to `expectedSummary`, and do not edit protected inputs or generated browser artifacts.

## Accepted and implemented before source SHA

- Remove the 3200ms busy-wait in `quality-gate-app/src/main.tsx` (P-01).
- Give the icon-only button an accessible name at `quality-gate-app/src/App.tsx:17` (A11Y-1). Integration wording is `Download dashboard`.
- Pessimistic `lighthouserc.json` and `scripts/quality-gate.mjs` that write `expectedSummary` then set `process.exitCode` (EI-02, EI-03, EI-10).

Source SHA: `44b789f75fabffb63b664a63b7e6fe7db2e2e054`. Capture command: `npm run quality:capture -- --sha 44b789f75fabffb63b664a63b7e6fe7db2e2e054` (exit 0). Generated files were not hand-edited.

## Proven on captured artifacts

- Worst case: performance 1.00, accessibility 1.00, LCP 1354 ms, axe 0. Gate exit 0.
- One mutated Lighthouse run at 0.89: exit 1, `performance below minimum` (EI-08).
- Injected axe `button-name`: exit 1, `axe violations above maximum` (EI-09).
- `npm run quality:verify` exit 0 against those artifacts.

## Rejected

A review round with zero accepted defects is only a review if dismissed claims are written down. Rejected as defects, with source:

- P-03 / A11Y-D2 / EI-13 `skipAudits: []` — `quality-verification.mjs:127` only fails on truthy length.
- P-06 `workflowApi.ts:4,7` async `wait()` — not imported from the render path; protected.
- P-07 extra `formFactor` / `throttlingMethod` — capture uses `onlyCategories` only (`capture-browser-evidence.mjs:73-74`).
- A11Y-D1 name-vs-no-op — naming the visible download icon without adding a handler preserves required behavior.
- A11Y-D5 unused protected components — `App.tsx` does not import them.
- A11Y-D4 / EI-15 throw on non-array `violations` — protected helper; required paths always pass an array.

## Deferred

- EI-15: malformed axe `violations` can throw before write. Off the required positive and negative controls. Not patched.

## After-attempt delta

`evidence/after.patch` remains the unaided after session. Integration did not take its `App.tsx` label (`Download evidence`) or its `lighthouserc.json` / `quality-gate.mjs` blobs. `main.tsx` blob IDs matched (`15a96a08`).

## Before-attempt finding

The unstructured before session already produced passing production Lighthouse and axe scores (worst performance 1.00, accessibility 1.00, LCP 1353 ms, axe 0) and passing synthetic negative controls. That baseline was not degraded. `quality:verify` still exited 1 because `--sha` was the starting commit `3761a42840cbbc4ee9143ecc914519b4f8c6cc0c`, which does not contain the UI fix. The independent variable is therefore enforceable Git binding and evidence-only history, not visual or measured quality.

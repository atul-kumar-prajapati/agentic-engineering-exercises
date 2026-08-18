# Before / After Comparison

## Independent variable

The only difference between the two matched sessions was the input material: the before session received the legacy brief, the after session received the incident report and observed runtime traces. Agent, model, tools, permissions, time limit, and first-attempt conditions were identical.

## Defect coverage

- Before: the duplicate-capture defect was invisible; the brief's claim that every valid delivery creates a new ledger entry justified the buggy behavior, so no fix was attempted.
- After: the incident named the double-posted `evt_capture_1`; the repair enforces signature, reference-ownership, and duplicate checks in that order, and the webhook tests prove each boundary.

## Relationship accuracy

- Before: four unsupported relationships were drawn (direct checkout-to-gateway call, declined-authorization retry, signature-suffices ownership, per-delivery ledger entries) and the data diagram invented relations not present in the source.
- After: every drawn relationship is one of VIS-01 through VIS-16, each traced to an exact source line at the source SHA, with no extra edges, transitions, or ER relationships beyond the implemented ones.

## Contradictions

- Before: none detected; brief claims were reproduced verbatim.
- After: BRIEF-01 through BRIEF-04 are each recorded as rejected with source references and explicit diagram decisions in `evidence/brief-contradictions.md`.

## Verification

- Before: no gates were run; the brief-led session had no contract to verify against.
- After: `npm run payment:trace`, `npm run diagrams:parse`, `npm run test:feature`, and the full `npm run verify:exercise` chain pass at the recorded commits; evidence hashes are bound to source SHA `17aa922f283a5554a3d6bb9a3f8c170ed1f051a6` in `evidence/diagram-manifest.json`.

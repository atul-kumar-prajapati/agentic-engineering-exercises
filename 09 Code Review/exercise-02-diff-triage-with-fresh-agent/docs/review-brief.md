# Fresh Review Brief

Review only `pr/review-target.diff` at the base and head SHAs in `fixtures/manifest.json`.

Acceptance boundaries:

- A saved owner, status, or note must survive filtering and reload.
- Damaged or non-array cached JSON must fall back safely instead of leaving the app loading.
- Default results may be ordered by due date, but imported fixture data must remain unchanged.
- Collecting evidence is read-only and must not change cached workflow state.
- Findings need a trigger, impact, file, head line, confidence, and blocker decision.

Do not use implementation chat, implementer notes, earlier reviews, or expected finding IDs. Return only findings supported by the comparison and surrounding code.

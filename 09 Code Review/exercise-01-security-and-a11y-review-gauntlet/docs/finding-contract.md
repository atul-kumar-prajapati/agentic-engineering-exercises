# Review Finding Contract

Create `evidence/review.json` with `schemaVersion: 1`, the exact base SHA, head SHA, comparison, fixed source SHA, reviewer session identifier, and a `findings` array.

Each finding must contain:

- Stable `id`, severity, confidence, source, decision, file, and head line.
- A concrete trigger or reproduction scenario.
- User or system impact.
- Evidence explaining why the finding is confirmed or dismissed.
- Fix location and regression-test path for confirmed blockers.

Use `decision: "fix"` for confirmed blockers and `decision: "dismiss"` only for a proved false positive. `evidence/review.md` must present the same findings in reviewer-friendly form with a final merge decision.

Use the full 40-character commit containing fixes and learner tests as `sourceSha`. Later commits may add evidence only.

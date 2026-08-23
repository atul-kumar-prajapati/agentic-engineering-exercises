# Review Finding Contract

Create `evidence/review.json` with `schemaVersion: 1`, the exact base SHA, head SHA, comparison, fixed source SHA, reviewer session identifier, and a `findings` array.

Each finding must contain:

- Stable `id`, severity, confidence, source, decision, file, and a short `anchor` copied from an added line in the protected diff. A scanner result in an unchanged surrounding file instead uses an anchor from that protected head file.
- A concrete trigger or reproduction scenario.
- User or system impact.
- Evidence explaining why the finding is confirmed or dismissed.
- Fix location and regression-test path for confirmed blockers.
- `dismissalProof` for a dismissed scanner result, including the inspected input path and reproduction result.

Use `decision: "fix"` for confirmed blockers and `decision: "dismiss"` only for a proved false positive. `evidence/review.md` must present the same findings in reviewer-friendly form with a final merge decision.

Use the full 40-character commit containing fixes and learner tests as `sourceSha`. Later commits may add evidence only.

Name at least one regression test with each confirmed finding ID in square brackets, for example `[REVIEW-7] rejects an invalid transition`. Run `npm run test:regression-proof`. The verifier reads structured Vitest results, requires every named finding test to fail on the protected vulnerable head, rejects collection or import failures, and requires the same tests to pass on the remediation.

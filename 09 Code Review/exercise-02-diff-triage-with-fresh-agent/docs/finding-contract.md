# Fresh Review Evidence Contract

Record the independent conditions in `evidence/reviewer-session.json`: a unique session ID, tool or model, start time, `contextMode: "fresh"`, the exact provided files, and excluded context.

Create `evidence/review.json` with `schemaVersion: 1`, protected base/head/comparison values, the source commit SHA, `mergeDecision: "request-changes"`, and all required findings.

Each finding needs its stable ID, classification, severity, confidence, file, head line, scenario, impact, and evidence. A blocker also needs its focused fix and a learner test under `tests/`. An unsupported claim needs a concrete dismissal.

Use the full 40-character commit containing only the focused source fixes and learner tests as `sourceSha`. Later commits may add evidence only. Keep `review.md` consistent with the structured review.

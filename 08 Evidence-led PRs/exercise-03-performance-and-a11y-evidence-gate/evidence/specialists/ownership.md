# Specialist ownership

Parent agent: Cursor Grok 4.6. Specialists launched with model slug `cursor-grok-4.6-high`. All three lanes were read-only: no file creates/edits/deletes and no mutating Git commands. Only the integration owner writes.

| Lane | Scope | Out of bounds | Verification command | Output | Write permission |
|---|---|---|---|---|---|
| Performance | `main.tsx` delay removal; Lighthouse performance/LCP assertions; worst-case min score / max LCP; one run at 0.89 must fail | Accessible naming, axe, Git SHA binding | `npm run typecheck`; `npm run build` | Verdict, per-item table, `file:line` | read-only |
| Accessibility | Icon-button accessible name; Lighthouse accessibility `minScore` 1 pessimistic; any axe violation fails the gate; no new button behavior | Main-thread delay, LCP, `numberOfRuns`, Git binding | Source inspection of `App.tsx:17-21`, `lighthouserc.json:23-28`, `quality-gate.mjs` axe path | Verdict, per-item table, `file:line` | read-only |
| Evidence integrity | CLI flags; `expectedSummary` deep-equal shape; `process.exitCode` after write; sourceSha 40-hex; working-tree `git diff --name-only sourceSha`; negative-control strings; capture overwrite refusal; `comparison.md` generated | Whether the 3200ms loop was the right UI fix; aria-label wording | Source inspection of `quality-gate.mjs`, `quality-verification.mjs`, `capture-browser-evidence.mjs`, `submission-contract.json` | Verdict, per-item table, unsatisfiability notes | read-only |

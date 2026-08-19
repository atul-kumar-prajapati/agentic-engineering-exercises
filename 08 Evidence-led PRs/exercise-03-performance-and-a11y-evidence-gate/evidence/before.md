# Before attempt

- Starting commit: `3761a42840cbbc4ee9143ecc914519b4f8c6cc0c`
- Implementation commit: none (first-attempt rule: do not commit). Capture was invoked with `--sha 3761a42840cbbc4ee9143ecc914519b4f8c6cc0c`, which does not contain the UI fix.
- Agent and model: Cursor / `cursor-grok-4.6-high`
- Tools and permissions: local worktree `/tmp/ex-08-03-before`, filesystem and npm inside `quality-gate-app` only
- Time limit: 45 minutes
- Human hints: 0
- Retries: 0
- Patch: `evidence/before.patch`

This unstructured session received no extra contracts. It still removed the 3200ms main-thread block, named the icon-only button `aria-label="Download report"`, added `lighthouserc.json` and `scripts/quality-gate.mjs`, and captured three production Lighthouse runs plus axe. That is a too-good baseline, not a problem to fix. `main.tsx` blob matched integration (`15a96a080d6f69758c0667a22b5eff5feefd5d4b`).

| Proof | Run 1 | Run 2 | Run 3 | Gate value |
|---|---:|---:|---:|---:|
| Performance | 1.00 | 1.00 | 1.00 | Worst 1.00 |
| Accessibility | 1.00 | 1.00 | 1.00 | Worst 1.00 |
| LCP in ms | 1353 | 1352 | 1352 | Worst 1353 |

- Axe violations: 0
- Accessible-name result: `aria-label="Download report"` on the icon-only button
- Production build SHA used as `--sha`: `3761a42840cbbc4ee9143ecc914519b4f8c6cc0c` (starting commit, not an implementation commit)
- Browser environment: Chrome major 151, simulated mobile, route `/`
- Gate exit code on those reports: 0, `releaseDecision: passed`
- Deliberate Lighthouse failure (run-1 performance 0.89): exit 1, `performance below minimum`
- Deliberate axe failure: exit 1, `axe violations above maximum`
- `npm run quality:verify`: exit 1 — `sourceSha must be an ancestor containing the UI fix and gate implementation`
- Files changed in `before.patch`: 4; +161 / −7

What a correct-looking before pack still cannot enforce: commit binding of the four implementation files, evidence-only follow-up history, and `quality:verify` exit 0. The after/integration pack adds those, plus generated comparison byte-identity and captured `quality-verify.txt`.

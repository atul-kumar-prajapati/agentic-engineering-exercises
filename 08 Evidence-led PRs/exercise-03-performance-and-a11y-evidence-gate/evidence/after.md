# After attempt

- Starting commit: `3761a42840cbbc4ee9143ecc914519b4f8c6cc0c`
- Implementation commit: none on the after branch (worktree left uncommitted). Integration source SHA: `44b789f75fabffb63b664a63b7e6fe7db2e2e054`
- Agent and model: Cursor / `cursor-grok-4.6-high`
- Tools and permissions: local worktree `/tmp/ex-08-03-after`, filesystem and npm inside `quality-gate-app` only
- Time limit: 45 minutes
- Human hints: 0
- Retries: 0
- Patch: `evidence/after.patch`

The after session received the repository contracts as its only extra input. It removed the 3200ms main-thread block, named the icon-only button `aria-label="Download evidence"`, and added `lighthouserc.json` plus `scripts/quality-gate.mjs`. It ran integrity/lint/test/format/typecheck/build (all exit 0) and a synthetic gate check (exit 0). It did not run `quality:capture`.

`after.patch` is that unaided attempt. Integration kept the same `main.tsx` blob (`15a96a080d6f69758c0667a22b5eff5feefd5d4b`) and diverged on:

- `App.tsx`: `Download dashboard` instead of `Download evidence`
- `lighthouserc.json` and `quality-gate.mjs`: different blobs, same contract

Measured production evidence below is from the integration source SHA, not from the after worktree.

| Proof | Run 1 | Run 2 | Run 3 | Gate value |
|---|---:|---:|---:|---:|
| Performance | 1.00 | 1.00 | 1.00 | Worst 1.00 |
| Accessibility | 1.00 | 1.00 | 1.00 | Worst 1.00 |
| LCP in ms | 1354 | 1352 | 1352 | Worst 1354 |

- Axe violations: 0 (`evidence/raw/axe.json`, `button-name` absent)
- Accessible-name result: icon button has a non-empty `aria-label`; SVG remains `aria-hidden="true"` (`quality-gate-app/src/App.tsx:17-18`)
- Production build SHA: `44b789f75fabffb63b664a63b7e6fe7db2e2e054`
- Browser environment: Chrome major 151, form factor mobile, throttling simulate; axe `chrome 151.0.7922.138`; route `/`; URL `http://127.0.0.1:4173/`
- Gate exit code on captured reports: 0 (`releaseDecision: "passed"`)
- Deliberate Lighthouse failure (run-1 performance set to 0.89): exit 1, `failed`, `performance below minimum`
- Deliberate axe failure (injected `button-name`): exit 1, `failed`, `axe violations above maximum`
- After patch files changed: 4 (`App.tsx`, `main.tsx`, `lighthouserc.json`, `quality-gate.mjs`); +250 / −7
- Integration source commit: 4 files, +123 / −7

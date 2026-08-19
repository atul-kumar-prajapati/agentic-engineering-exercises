# Evidence integrity specialist handoff

Reviewer: `cursor-grok-4.6-high`. Worktree `/tmp/ex-08-03` (review ran before the source commit). Verdict **PASS**. Integration owner re-derived each item against source; then committed the four implementation files as `44b789f75fabffb63b664a63b7e6fe7db2e2e054` and generated evidence once via `npm run quality:capture -- --sha 44b789f75fabffb63b664a63b7e6fe7db2e2e054`.

| id | file:line | specialist | integration disposition | reasoning |
|---|---|---|---|---|
| EI-01 | `quality-gate.mjs:29-33` | dismiss (CLI met) | **reject as defect** | Flags match `invokeGate` at `quality-verification.mjs:169-177`. |
| EI-02 | `quality-gate.mjs:80-82` | dismiss | **reject as defect** | `writeFileSync` then `process.exitCode`. Failed decisions still write. |
| EI-03 | `quality-gate.mjs:45-51` + `quality-verification.mjs:105-116,141-143` | dismiss | **reject as defect** | Valid path assigns `expectedSummary` with no extra `passed` boolean. Positive `quality:verify` exit 0 proves deep-equal. |
| EI-04 | `quality-gate.mjs:52-59` | dismiss | **reject as defect** | Identity failures only override `failures` / `releaseDecision`. Same key set. |
| EI-05 | `quality-gate.mjs:35-37` | dismiss | **reject as defect** | `--sha` is `/^[a-f0-9]{40}$/`, same as capture. |
| EI-06 | `quality-verification.mjs:72` via `quality-gate.mjs:42` | dismiss | **reject as defect** | Captured `evidence/raw/axe.json` `sourceSha` equals the commit SHA. |
| EI-07 | `quality-verification.mjs:48,83` | dismiss (no cycle) | **reject as defect** | Digests hash raw bytes. Summary is not hashed into itself. One-way chain. |
| EI-08 | `quality-verification.mjs:197-205` | dismiss | **accept as proven** | Owner mutated captured `run-1.json` performance to 0.89: exit 1, `performance below minimum`. |
| EI-09 | `quality-verification.mjs:207-216` | dismiss | **accept as proven** | Owner injected `button-name`: exit 1, `axe violations above maximum`. |
| EI-10 | `quality-verification.mjs:156-167` | integrator constraint | **accept constraint** | Source commit contains `main.tsx`, `App.tsx`, `lighthouserc.json`, `quality-gate.mjs`. `git diff --name-only sourceSha` is vs the working tree. Later commits must stay under `evidence/`. |
| EI-11 | `capture-browser-evidence.mjs:52` | dismiss | **reject as defect** | Capture refuses existing targets. Pack generated once. |
| EI-12 | `capture-browser-evidence.mjs:121-125` + `verify-quality-evidence.mjs:52-54` | dismiss (wiring) | **accept as proven** | `quality:verify` exit 0 includes generated `comparison.md` byte-match. |
| EI-13 | `lighthouserc.json:1-40` | dismiss | **reject as defect** | 880 characters; required substrings present; `verifyLighthouseConfig` empty. |
| EI-14 | `quality-gate.mjs` 2941 chars | dismiss | **reject as defect** | Required substrings present. |
| EI-15 | `quality-gate.mjs:73` / `expectedSummary` `:98` | defer | **defer** | If `axe.axe` exists and `violations` is not an array, `.length` throws before write. Capture and the mandated mutation always pass an array (`quality-verification.mjs:75,209`). Off the required controls. |

Unsatisfiability notes from the review (no source commit / no `evidence/` yet) were true at review time and are closed by the source commit plus one capture run.

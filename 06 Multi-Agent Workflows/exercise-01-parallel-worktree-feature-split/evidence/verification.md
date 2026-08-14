# Verification Output

Final integrated verification ran on 2026-08-14 from `worktree-feature-app` using the repository-local dependencies in this exercise only.

| Gate | Result | Evidence |
|---|---|---|
| `npm run lanes:verify` equivalent | passed | All three rewritten lane commits are inspectable; filter 1/1, scoring 2/2, and evidence export contract passed |
| `npm run test:submission` equivalent | passed | `Verified Parallel Worktree Conflict Rescue: 3 files and 0 directories.` |
| `npm run agent:check` equivalent | passed | protected-input integrity, lint, agent contract, format, TypeScript, and production build all passed |

The bundled environment did not expose an `npm` binary, so the same package scripts were executed directly with the bundled Node runtime and exercise-local binaries:

- `node scripts/verify-lane-handoffs.mjs` — passed.
- `node scripts/feature-check.mjs` — passed; four assertions across the three lanes.
- `node ../../../scripts/verify-submission-contract.mjs ./submission-contract.json` — passed.
- `node ../../../scripts/verify-protected-inputs.mjs ./challenge-integrity.json` — passed; all five company inputs unchanged.
- `node scripts/lint-check.mjs` — passed.
- `node scripts/agent-check.mjs` — passed.
- `node scripts/format-check.mjs` — passed.
- `./node_modules/.bin/tsc -b --pretty false` — passed.
- `./node_modules/.bin/vite build` — passed; 42 modules transformed, output generated in 271 ms.

The integration branch and all three lane branches are based on `f714944e792ad1107695a343d630b080eb4e43a9` from `origin/feature/improve-exercise-challenges`. No dependency was installed globally or at the repository root; the ignored dependency directory is scoped to `worktree-feature-app`.

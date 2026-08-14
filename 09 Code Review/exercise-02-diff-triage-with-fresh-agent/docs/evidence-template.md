# Independent Diff Triage Evidence

Use full Git SHAs, exact prompts, commands, exit codes, finding IDs, and source locations.

## `evidence/before.md`

Record review base and head SHAs, reviewer agent and model, tools, permissions, time limit, context provided, baseline command results, and `evidence/before.patch`.

## `evidence/after.md`

Record remediation SHA, recheck agent and model, `npm run test:cache`, `npm run triage:verify`, and `npm run agent:check` exit codes, fixed finding IDs, dismissed claim, files changed, lines added and removed, and `evidence/after.patch`.

## `evidence/comparison.md`

Compare reproduced blockers, unsupported claims, scope, regression tests, and command results. Link each decision to an exact source location or test.

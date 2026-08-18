# Cursor learnings from 8.2 (feature-flag-rollback-proof)

For a future run of yourself. Not a report.

## Verification chain, in order

1. Read `challenge-integrity.json` and every `scripts/*verif*.mjs` before editing. `verifyGitBinding` requires `sourceSha` to be a 40-char ancestor of HEAD that already contains `invoicePreview.mjs` and `rollback-invoice-preview.mjs`. Every commit after that SHA may only touch `…/evidence/**` (`git diff --name-only <sourceSha>`).
2. Repair `src/rollout/invoicePreview.mjs` and add `scripts/rollback-invoice-preview.mjs`. Do not touch protected files. `invoicePreview.mjs` is not protected; the rollback script is new.
3. Commit those two files. That commit is `sourceSha`.
4. While HEAD equals that SHA, generate:
   - `npm run rollout:capture -- --scenario {enabled,disabled,provider-error} --sha <sourceSha> --output ../evidence/<id>.json`
   - `npm run rollback:drill -- --sha <sourceSha> --json ../evidence/rollback-drill.json --markdown ../evidence/rollback-drill.md`
   Do not edit the generated JSON or Markdown.
5. Capture `npm run rollout:verify > ../evidence/commands/rollout-verify.txt` (the file the submission contract hashes against). Then write before/after/comparison from measured first attempts.
6. Commit evidence only. Re-run `npm run verify:exercise` after that commit — a pass before the last commit does not bind Git history.
7. Two extra guardrails the prompt requires and the verifier does not. Put them in `evidence/guardrails.md` or they did not happen:
   - After `verify:exercise`, `git status --porcelain --untracked-files=no` must be empty. Full porcelain that only lists pre-existing `??` files outside the exercise is not a verification mutation; identical before/after listings prove it. Record both.
   - `git checkout upstream/main -- "$path"` for every path in `challenge-integrity.json` (quote; the exercise directory has spaces). Then `verify:exercise` still exit 0 and `git diff HEAD` empty.

`verify:exercise` order inside npm: `agent:check` (integrity, lint, test, format, typecheck, build) → `test:rollout` → `rollout:verify` + submission-contract. `runReproduction` recaptures to `os.tmpdir()`, so it does not restamp tracked evidence. That is why 8.2 is not the 7.2 cycle.

## What the harness makes awkward

Capture scripts emit three scenario JSON files. The flag brief and `run-rollout-tests.mjs` require five states. Invalid context and preview-API failure have no generated JSON. Prove them with a separate `executeScenario` dump (`evidence/commands/five-states.txt`) and cite `invoicePreview.mjs` branches. Do not invent a fourth capture scenario; the fixture is protected.

`git diff --name-only <sourceSha>` ignores untracked files. Uncommitted evidence will not fail Git binding. That is not permission to skip the evidence commit.

`git checkout upstream/main -- $(cat paths.txt)` splits on spaces in `08 Evidence-led PRs`. Use a `while IFS= read -r p` loop.

`working_directory` is unreliable when the path contains spaces. `cd "…/feature-flag-app"` inside the command. After a worktree `cd`, do not trust persisted cwd.

`build` writes `dist/`; it is gitignored. Do not treat ignored build output as a dirty tree.

An ordinary first attempt will often get default `false` and the enabled telemetry payload right, and still fail: mismatched targeting keys that still call the API, wrong reason tokens (`provider-error` / `api-error`), rollback that accepts `not-a-timestamp` and mutates. Measure the before branch; do not assume it is uniformly wrong.

## Habits that beat 7.2

Record the model slug in the launched Task call (`cursor-grok-4.6-high`) and in `before.md` / `after.md`. "Inherited model" makes the before/after comparison irreproducible.

Put required checks in `evidence/`. Chat and PR notes are not evidence. 8.2's porcelain and protected-restore runs were correct and still failed the follow-up audit until they lived in `evidence/guardrails.md`.

This exercise's `sourceSha` is an argument to capture/drill, not a field regenerated from HEAD into a file that must exist in that same commit. Do not treat 7.2's circular graph restamp as the default. If a required gate can only pass by editing a protected file or by storing a SHA inside the commit that SHA names, stop before committing.

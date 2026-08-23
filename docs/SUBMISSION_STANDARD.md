# Exercise Submission Standard

The exercise README is the main source of instructions. Follow it when it is more specific than this document.

## Common Rules

- Work on only one exercise in each PR.
- Keep changes inside the selected exercise unless the README says otherwise.
- Place all requested proof under the exercise's `evidence/` folder.
- Record exact commands, results, and exit codes. Do not claim that a check passed without proof.
- Do not commit secrets, `node_modules`, build output, caches, or unrelated reports.
- Do not change verification scripts, contracts, fixtures, or protected inputs to force a passing result.
- Raise the PR from your fork to the original repository.

## Comparable Before and After Proof

When an exercise requests `before.md`, `before.patch`, `after.md`, `after.patch`, and `comparison.md`:

- Use the same starting commit, agent and model, tools and permissions, time limit, zero hints, and zero retries.
- Record the full 40-character starting SHA and a separate implementation SHA for each run.
- Record the SHA-256 of each patch in its Markdown file.
- Generate both patches with `git diff --binary --full-index <starting-commit> <that-run-implementation-commit>`.
- Use `Same conditions`, `Before`, `After`, `Proof`, and `Conclusion` in the comparison.

The shared verifier checks these fields, confirms that both implementation commits descend from the starting commit, and verifies that each patch exactly matches its recorded commit. It also rejects changes to the protected manifest or protected inputs after the starting commit.

Trusted CI should also set `CHALLENGE_TRUSTED_REF` to the pull request base SHA when running `test:integrity`. This makes the integrity manifest itself part of the protected input instead of trusting a manifest supplied by the learner branch.

## Final Verification

Run the exercise's final verification command before opening the pull request. The command must not rewrite tracked files, stage changes, or create, remove, or rewrite untracked and ignored paths. Builds run in a temporary output directory. The shared verification guard compares repository state before and after the exercise checks and fails if verification changes it.

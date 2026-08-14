# Parallel Worktree Conflict Rescue Evidence

Use 40-character Git SHAs, paths relative to `worktree-feature-app`, exact commands, and captured outputs.

## lane-handoffs.json

```json
{
  "schema_version": 1,
  "base_sha": "40-character SHA",
  "lanes": [
    {
      "lane": "A",
      "agent": "agent and session identifier",
      "branch": "lane/saved-filters",
      "worktree_path": "absolute path used for the linked worktree",
      "status": "ready",
      "base_sha": "same base SHA",
      "commit_sha": "lane commit SHA",
      "owned_paths": ["declared owned path prefixes"],
      "changed_paths": ["paths from the lane commit"],
      "shared_requests": [{ "path": "src/types.ts", "symbol": "FilterPreset", "reason": "why promotion is needed" }],
      "verification": {
        "command": "npm run test:lane-a",
        "exit_code": 0,
        "output_path": "evidence/commands/lane-a.txt",
        "output_sha256": "64-character SHA"
      },
      "rollback": "git revert <commit SHA>",
      "risks": "remaining risk or none"
    }
  ]
}
```

Add lanes B and C using their exact branches, paths, commands, and shared requests. Lane B has an empty `shared_requests` array.

## integration.json

Record the integration branch, base SHA, merge order, three merge commit SHAs, `shared_commit_sha`, `product_head`, and the integrated command output path, hash, and exit code. `product_head` must equal the shared-type commit because later commits may contain only exercise evidence.

## Worktree captures

Save `git worktree list --porcelain` while all three linked worktrees exist to `worktree-list-before.txt`. After final verification, remove the linked worktrees and save the command again to `worktree-list-after.txt`.

## integration.md

Explain lane review decisions, shared requests, merge order, any conflicts, shared-type resolution, final checks, cleanup, remaining risk, and rollback order.

## Required Before and After Files

- `evidence/before.md` records the clean base SHA, initial worktree list, initial checks, lane ownership, and session conditions.
- `evidence/before.patch` captures the starting feature state as a genuine Git diff artifact.
- `evidence/after.md` records lane commits, merge commits, shared commit, final checks, changed files, and line counts.
- `evidence/after.patch` is the genuine integrated product diff from the base SHA.
- `evidence/comparison.md` compares planned lanes, actual ownership, conflicts, history, and final behavior.

# Kanban Control-Plane Evidence

Use 40-character Git SHAs, paths relative to `kanban-control-app`, exact commands, and captured outputs.

## control-plane.json

```json
{
  "schema_version": 1,
  "base_sha": "40-character SHA",
  "lane": {
    "card_id": "ESC-120",
    "agent": "agent and session identifier",
    "branch": "lane/esc-120-inherited-severity",
    "base_sha": "same base SHA",
    "commit_sha": "lane commit SHA",
    "owned_paths": ["src/utils/scoring.ts", "src/components/SeverityBadge.tsx", "tests/esc-120/"],
    "changed_paths": ["exact paths from Git"],
    "verification": {
      "command": "npm run feature:verify",
      "exit_code": 0,
      "output_path": "evidence/commands/esc-120.txt",
      "output_sha256": "SHA-256"
    },
    "reviewer": "reviewer identity",
    "review_decision": "accept",
    "review_path": "evidence/completed-lane.md",
    "review_sha256": "SHA-256",
    "rollback": "git revert <merge commit SHA>"
  },
  "integration": {
    "branch": "integration/kanban-control",
    "merge_commit_sha": "no-ff merge commit SHA",
    "board_verification": {
      "command": "npm run board:verify",
      "exit_code": 0,
      "output_path": "evidence/commands/board.txt",
      "output_sha256": "SHA-256"
    },
    "decision": "accept"
  }
}
```

`completed-lane.md` records the base and lane SHAs, ownership review, changed paths, focused result, reviewer decision, integration SHA, rollback, and remaining risk.

The feature commit contains only the owned source and test paths. Board, ownership, integration, and evidence updates come after the merge.

## Required Before and After Files

- `evidence/before.md` records the base SHA, invalid card states, ownership collisions, reservations, and initial checks.
- `evidence/before.patch` captures the invalid control-plane state as a genuine Git diff artifact.
- `evidence/after.md` records the lane and merge SHAs, final card states, released paths, checks, changed files, and line counts.
- `evidence/after.patch` is the genuine final product and control-plane diff.
- `evidence/comparison.md` compares assignment safety, collisions, board consistency, history, and final behavior.

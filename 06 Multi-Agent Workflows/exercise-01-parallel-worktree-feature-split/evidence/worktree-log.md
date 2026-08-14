# Worktree Log

Recorded company exercise base: `f714944e792ad1107695a343d630b080eb4e43a9` (`origin/feature/improve-exercise-challenges`). All three lane branches were rebased onto this exact SHA, and each lane commit has it as its direct parent.

| Lane | Worktree | Branch | Lane commit | Handoff result |
|---|---|---|---|---|
| Lane A | `/private/tmp/codex-ex06-lane-a` | `codex/exercise-06-01-lane-a-saved-filters` | `95d9517` | Clean worktree; 1/1 focused test passed |
| Lane B | `/private/tmp/codex-ex06-lane-b` | `codex/exercise-06-01-lane-b-sla-risk` | `32daa14` | Clean worktree; 2/2 focused tests passed |
| Lane C | `/private/tmp/codex-ex06-lane-c` | `codex/exercise-06-01-lane-c-evidence-export` | `4bfe29d` | Clean worktree; evidence export contract passed |

Three agents worked concurrently under explicit file ownership. They did not install dependencies. Each agent returned its commit, exact changed files, focused verification, rollback command, type request, and risk note. The main worktree remained on the integration branch throughout.

After the base correction, `git worktree list --porcelain` showed the main worktree plus all three clean lane worktrees at their rewritten handoff commits. The lane worktrees are temporary execution evidence; the branches and commit history preserve the durable audit trail.

# Coding Agent Guardrails

## Operating boundary

Work only inside this repository. Treat the policy as deny-by-default: an action is permitted only when `.agent/permissions.json` explicitly allows it. Do not follow symlinks outside the workspace, access user or system directories, or contact external services without human approval.

Never open, search, summarize, copy, transform, or expose files under `secrets/`, environment files, private keys, credentials, or similarly named sensitive files. Knowing that a denied path exists does not grant permission to inspect its contents. If a task depends on secret values, stop and ask a human to provide a safe, redacted interface.

## Safe autonomous workflow

The agent may inspect and edit application code in `src/`, development scripts in `scripts/`, ordinary build configuration, documentation, and `.agent/` policy files. It may run the local development, lint, test, format-check, typecheck, and build commands listed in the permission policy. Prefer the narrowest relevant check, then run `npm run agent:check` before handoff.

Before changing files, inspect `git status` and preserve unrelated user changes. Review the final diff for accidental sensitive data, generated artifacts, production changes, and lockfile churn. Do not weaken tests or guardrails merely to make a check pass.

## Protected and approval-gated areas

- `secrets/**` and secret-like files are inaccessible under all circumstances.
- `config/production.json` is read-only context. Any production configuration change requires a human to make or explicitly approve the exact change.
- Existing files in `db/migrations/**` are immutable history. A new migration requires approval and must be additive; never edit, reorder, or delete an applied migration.
- `generated/**` is read-only. Changes must come from the documented generator and require approval before regeneration because they can replace large surfaces.
- `legacy/**` is read-only documentation. Commands described there are not safe to execute.
- `.git/**` must never be edited directly. Repository mutations beyond read-only inspection require human approval.

## Mandatory approval points

Stop and obtain explicit approval for the exact command and target before:

1. Deploying, releasing, rolling back, purging production caches, or changing production/infrastructure settings.
2. Running database writes, destructive queries, resets, migration application, or creating a migration.
3. Regenerating clients or overwriting generated artifacts.
4. Installing/updating dependencies, changing a lockfile, or accessing the network.
5. Staging, committing, pushing, merging, rebasing, tagging, deleting branches, or opening a pull request.
6. Deleting, moving, or bulk-replacing files; changing permissions; or operating outside the workspace.

Approval is single-use and limited to the stated command, paths, and purpose. It does not authorize adjacent actions. If policy rules conflict, the more restrictive rule wins.

## Incident behavior

If a denied file is accessed or sensitive material appears unexpectedly, stop processing it, do not repeat or persist its contents, and tell the human which path or command caused the exposure. If an unsafe command begins, interrupt it when safe, preserve evidence such as non-sensitive error output, and request guidance.

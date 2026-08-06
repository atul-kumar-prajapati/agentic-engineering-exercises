# Deny Rules

These rules are unconditional unless a rule explicitly says that a human may perform the action. Approval does not override access to secrets or destructive/history-rewriting prohibitions.

## Forbidden file operations

- Do not read, grep, index, watch, diff, copy, archive, encode, upload, or edit `secrets/**`, `.env*`, credentials, tokens, private keys, certificates, or secret-like files.
- Do not edit or delete `config/production.json`, existing `db/migrations/**`, `generated/**`, or `legacy/**`.
- Do not edit `.git/**` directly or use symlinks/path traversal to bypass path restrictions.
- Do not write outside the repository or touch unrelated worktrees.
- Do not recursively delete, bulk-move, mass-replace, or change file ownership/permissions.
- Do not commit build output, dependency directories, logs, dumps, coverage, or temporary files unless the repository explicitly tracks them.

## Forbidden commands and command classes

- Production/release: `deploy-prod`, `rollback-prod`, `purge-release-cache`, and any deploy, release, rollback, infrastructure-apply, or production-console equivalent.
- Filesystem destruction: `rm -rf`, `rmdir /s`, `del /s`, recursive `Remove-Item`, disk formatting, secure erase, or equivalents.
- Git destruction/history rewrite: `git reset --hard`, `git clean -fdx`, force push, branch/tag deletion, reflog expiry, or direct writes under `.git`.
- Database destruction: `DROP`, `TRUNCATE`, unscoped `DELETE`/`UPDATE`, database reset, migration rollback, or applying migrations to shared/production databases.
- Secret disclosure: `env`, `printenv`, shell history dumps, credential-store reads, or commands that print/decode/upload protected values.
- Remote execution or exfiltration: piping downloads into a shell, unreviewed scripts fetched from the network, arbitrary uploads, or sending repository data to third parties.
- Safety bypass: disabling hooks/checks, using `--no-verify`, weakening this policy, suppressing failures, or altering tests solely to conceal a failure.

## Safe alternatives

Use targeted edits under allowed paths, local read-only inspection, and the package scripts declared in `package.json`. For generated code, migrations, production configuration, dependencies, or repository publication, prepare a proposal or diff description and ask a human to authorize the narrowly scoped next step.

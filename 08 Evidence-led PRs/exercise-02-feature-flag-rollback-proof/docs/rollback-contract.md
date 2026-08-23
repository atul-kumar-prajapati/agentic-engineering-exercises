# Rollback Command Contract

Create this CLI:

```text
node scripts/rollback-invoice-preview.mjs --config <path> --actor <value> --reason <value> --timestamp <ISO-8601> --expected-revision <value>
```

Validate every input before changing the file. Require schema version `1`, flag key `invoice-preview-v2`, a non-empty actor and reason, a valid timestamp, and a current revision equal to `--expected-revision`. Invalid or stale input must return non-zero and leave the configuration byte-for-byte unchanged.

Preserve unrelated fields, then:

- Set `enabled` to `false`.
- Replace `allowlist` with an empty array.
- Set `revision` to `rollback-<timestamp with punctuation replaced by hyphens>`.
- Add `lastRollback` containing `actor`, `reason`, `timestamp`, and `previousRevision`.

Write formatted JSON with a trailing newline to a temporary file in the same directory, then atomically rename it over the target. Do not mutate the protected starter configuration directly; the drill supplies a temporary copy.

Prevent two commands from replacing the same revision. Use a lock created atomically in the config directory, recheck the revision while holding it, and remove the lock on success or failure. When `NODE_ENV=test` and `ROLLBACK_TEST_FAIL_BEFORE_RENAME=1`, stop after the temporary write but before rename, return non-zero, and clean up both temporary and lock files. This protected fault injection proves the original file survives an interrupted update.

The protected drill traces the command's real filesystem calls. It must observe an exclusive lock, a revision read while that lock is held, a same-directory temporary write, and a rename over the target. A direct target write or an early test-only exit fails. The drill also holds the first lock briefly so the two-process concurrency check is guaranteed to overlap.

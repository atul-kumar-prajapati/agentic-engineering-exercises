# Rollback Command Contract

Create this CLI:

```text
node scripts/rollback-invoice-preview.mjs --config <path> --actor <value> --reason <value> --timestamp <ISO-8601>
```

Validate every input before changing the file. Require schema version `1`, flag key `invoice-preview-v2`, a non-empty actor and reason, and a valid timestamp. Invalid input must return non-zero and leave the configuration byte-for-byte unchanged.

Preserve unrelated fields, then:

- Set `enabled` to `false`.
- Replace `allowlist` with an empty array.
- Set `revision` to `rollback-<timestamp with punctuation replaced by hyphens>`.
- Add `lastRollback` containing `actor`, `reason`, `timestamp`, and `previousRevision`.

Write formatted JSON with a trailing newline to a temporary file in the same directory, then atomically rename it over the target. Do not mutate the protected starter configuration directly; the drill supplies a temporary copy.

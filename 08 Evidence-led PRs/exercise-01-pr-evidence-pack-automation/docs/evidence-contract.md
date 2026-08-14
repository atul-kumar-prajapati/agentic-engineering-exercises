# Evidence Pack Contract

The generator CLI is:

```text
node scripts/generate-pr-evidence.mjs --fixture <fixture.json> --sha <40-character-sha> --output <directory>
```

Write `<output>/pr-evidence.json` with:

- `schemaVersion: 1`.
- `sourceSha` equal to `--sha`.
- `fixtureSha256` calculated from the exact fixture bytes.
- `overallResult` equal to `passed` only when all checks pass; otherwise `failed`.
- `overallExitCode` equal to `0` for passed and the first failing non-zero exit code for failed.
- One `checks` entry per fixture entry, in the same order.

Each check entry contains the exact `name`, `command`, `exitCode`, `result`, `risk`, `reviewerAction`, and `rollback`, plus:

```json
{
  "artifact": {
    "path": "artifacts/checkout-smoke.txt",
    "sha256": "64 lowercase hexadecimal characters"
  }
}
```

Artifact paths are relative to the output directory, use `/`, and cannot contain `..` or absolute paths. Exit only after the complete pack has been written, using `overallExitCode` as the process exit code.

Also write `<output>/summary.md`. It must contain the source SHA, overall result and exit code, and every check's name, result, exit code, artifact path, artifact SHA-256, risk, reviewer action, and rollback. Write both files and all artifacts before exiting.

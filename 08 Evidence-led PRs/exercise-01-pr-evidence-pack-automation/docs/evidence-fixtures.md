# Evidence Fixture Guide

Each protected fixture contains `schemaVersion` and a `checks` array. Every check supplies:

- `name`, `command`, `exitCode`, and `result`.
- `outputPath`, resolved relative to the fixture file.
- `risk`, `reviewerAction`, and `rollback`.

The generator must work with any valid fixture using this shape. It must not special-case check names or rewrite failures.

For each check, copy the source artifact into `<output>/artifacts/` using its filename. Reject duplicate filenames, missing files, paths outside the fixture directory, invalid result and exit-code combinations, and an invalid source SHA.

The protected verifier runs both `check-results.json`, whose overall exit is `1`, and `check-results-pass.json`, whose overall exit is `0`.

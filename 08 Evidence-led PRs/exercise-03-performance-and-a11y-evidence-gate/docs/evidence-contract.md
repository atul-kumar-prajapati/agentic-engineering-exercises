# Quality Evidence Contract

First commit the UI fix, `lighthouserc.json`, and `scripts/quality-gate.mjs`. Use that full 40-character commit SHA for all evidence.

Generate browser evidence from `quality-gate-app`:

```text
npm run quality:capture -- --sha <source-sha>
```

This creates:

- `evidence/raw/lighthouse/run-1.json` through `run-3.json`.
- `evidence/raw/axe.json`.
- `evidence/quality-summary.json`.
- `evidence/comparison.md`.

Do not edit generated files. Capture final verification output:

```text
npm run quality:verify > ../evidence/commands/quality-verify.txt
```

The source commit must contain the implementation. Commits after it may add evidence only.

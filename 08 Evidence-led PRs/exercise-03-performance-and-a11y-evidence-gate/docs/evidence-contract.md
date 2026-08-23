# Quality Evidence Contract

First commit the UI fix, `lighthouserc.json`, and `scripts/quality-gate.mjs`. Use that full 40-character commit SHA for all evidence.

Generate browser evidence from `quality-gate-app`:

```text
npm run quality:capture -- --sha <source-sha>
```

This creates:

- `evidence/raw/lighthouse/run-1.json` through `run-3.json`.
- `evidence/raw/axe.json`.
- `evidence/capture-manifest.json` with the source SHA, configuration digest, production-build digest, browser channel and version, and SHA-256 of every raw report.
- `evidence/capture-complete.json`, written last, which proves publication finished and binds the manifest digest.
- `evidence/quality-summary.json`.
- `evidence/comparison.md`.

Do not edit generated files. Capture final verification output:

```text
npm run quality:verify > ../evidence/commands/quality-verify.txt
```

The source commit must contain the implementation. Commits after it may add evidence only.

## Browser setup

Use Node.js from the repository `.nvmrc`, then run `npm ci` and `npx playwright install chrome`. The default channel is `chrome`; set `QUALITY_GATE_BROWSER_CHANNEL` only when the review environment uses a different installed Chromium channel. Record the channel and version in the capture manifest. Lighthouse and axe both use the protected mobile viewport and device scale. The completion marker is published last; if publication is interrupted before that marker exists, the next capture removes only the incomplete generated targets and starts again safely.

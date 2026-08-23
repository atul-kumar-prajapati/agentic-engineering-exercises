# Quality Gate CLI Contract

Create this CLI:

```text
node scripts/quality-gate.mjs --lighthouse-dir <path> --axe <path> --contract <path> --sha <40-character-sha> --output <path>
```

Read exactly three raw Lighthouse JSON reports and one generated axe JSON report. Validate their route, browser environment, metrics, digests, and source SHA before making a decision.

Write `quality-summary.json` before exiting. It must contain:

- `schemaVersion`, `sourceSha`, `route`, and `aggregation`.
- The protected thresholds.
- Each Lighthouse file, SHA-256 digest, capture time, version, URL, environment, performance, accessibility, and LCP.
- The axe file, digest, tested URL, browser, and violations.
- `worstCase`, `failures`, and `releaseDecision`.

Use the minimum performance and accessibility scores and maximum LCP across all runs. Return `0` only for `releaseDecision: "passed"`. Return non-zero after writing the summary for invalid or failing evidence.

The Lighthouse configuration must explicitly use mobile form factor, simulated throttling, and this screen emulation: width `412`, height `823`, device scale factor `1.75`, mobile `true`, and disabled `false`. This keeps the audited device consistent across machines.

# Rollout Evidence Contract

Use one 40-character source SHA for every evidence file. That commit must contain the corrected boundary and rollback command.

Generate scenario evidence with:

```text
npm run rollout:capture -- --scenario <enabled|disabled|provider-error> --sha <source-sha> --output ../evidence/<scenario>.json
```

Each JSON file records `schemaVersion`, `sourceSha`, `scenario`, `flagKey`, `configSha256`, `context`, `evaluation`, `outcome`, `apiCalls`, `telemetry`, and `result`.

Generate rollback evidence with:

```text
npm run rollback:drill -- --sha <source-sha> --json ../evidence/rollback-drill.json --markdown ../evidence/rollback-drill.md
```

The drill uses a temporary copy of the protected configuration. Do not edit the generated JSON or Markdown.

After all evidence exists, capture:

```text
npm run rollout:verify > ../evidence/commands/rollout-verify.txt
```

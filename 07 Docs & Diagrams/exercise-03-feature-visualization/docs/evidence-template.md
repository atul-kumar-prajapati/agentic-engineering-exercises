# Payment Visualization Evidence

## traceability.json

```json
{
  "schema_version": 1,
  "source_sha": "40-character Git SHA",
  "relationships": [
    {
      "id": "VIS-01",
      "source_path": "payment-workflow-app/src/App.tsx",
      "source_line": 1,
      "source_excerpt": "exact source line containing VIS: VIS-01",
      "diagram_paths": ["diagrams/payment-architecture.mmd", "diagrams/payment-sequence.mmd"]
    }
  ]
}
```

Add `VIS-01` through `VIS-16`. Use the exact source marker line at `source_sha` and the diagram paths in the diagram contract.

## brief-contradictions.md

Record `BRIEF-01` through `BRIEF-04` in brief order. For each claim, include the short claim, `Result: supported` or `Result: rejected`, an exact source or test reference, and the diagram decision.

## diagram-manifest.json

Record `source_sha`; the path, Mermaid type, and SHA-256 of all four diagrams; SHA-256 values for `traceability.json` and `brief-contradictions.md`; and the exact command, exit code, output path, and output SHA-256 for:

- `npm run payment:trace > ../evidence/commands/payment-trace.txt`
- `npm run diagrams:parse > ../evidence/commands/diagram-parse.txt`

## verification.md

Record the source SHA, feature-test result, Mermaid parser result, semantic diagram result, traceability result, contradiction result, remaining uncertainty, and final conclusion.

## Required Before and After Files

- `evidence/before.md` and `evidence/after.md` record matching session conditions, defect results, unsupported relationships, parser results, and changed files.
- `evidence/before.patch` and `evidence/after.patch` are genuine Git diffs for the brief-led and source-led attempts.
- `evidence/comparison.md` compares defect coverage, relationship accuracy, contradictions, and verification.

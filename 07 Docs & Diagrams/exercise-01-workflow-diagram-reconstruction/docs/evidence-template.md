# Workflow Reconstruction Evidence

## traceability.json

```json
{
  "schema_version": 1,
  "source_sha": "40-character Git SHA",
  "edges": [
    {
      "id": "WF-01",
      "from": "draft",
      "to": "submitted",
      "condition": "request status is draft",
      "actor": "Employee",
      "source_path": "workflow-reconstruction-app/src/workflow.tsx",
      "source_line": 1,
      "source_excerpt": "exact source line containing EDGE: WF-01",
      "diagram_paths": ["diagrams/access-state.mmd", "diagrams/access-approval-sequence.mmd"]
    }
  ]
}
```

Add `WF-01` through `WF-10`. Source lines must exist at `source_sha`, contain the matching edge marker, and agree with the declared transition and actor.

## diagram-manifest.json

Record `source_sha`; each diagram's path, type, and SHA-256; `traceability.json` and `contradictions.md` SHA-256; and the exact command, exit code, path, and SHA-256 for both captured command outputs.

Use:

- `npm run workflow:trace > ../evidence/commands/workflow-trace.txt`
- `npm run diagrams:parse > ../evidence/commands/diagram-parse.txt`

## contradictions.md

Record `LEG-01` through `LEG-04` and `CODE-01`. For each, quote only the short disputed claim, cite the conflicting source path and line, state which behavior the diagrams show, and explain why.

## verification.md

Record the source SHA, Mermaid parser result for all three files, semantic verifier result, scenario trace result, unsupported-edge check, contradiction count, remaining ambiguity, and final conclusion.

## Required Before and After Files

- `evidence/before.md` and `evidence/after.md` record matching session conditions, unsupported edge counts, missing paths, parser results, and changed files.
- `evidence/before.patch` and `evidence/after.patch` are genuine Git diffs for the document-led and source-led diagram attempts.
- `evidence/comparison.md` compares edge accuracy, actor coverage, contradictions, and verification.

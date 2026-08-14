# Skill Trigger Boundary Evals Evidence

Record observed results. Do not replace model trigger decisions with keyword matching or inferred outcomes.

## before-results.json and after-results.json

Both files must use this structure:

```json
{
  "schema_version": 1,
  "skill_name": "change-review",
  "description_sha256": "64-character hash printed by the validator",
  "environment": {
    "agent": "agent name and version",
    "model": "model name and version",
    "runtime": "skill runtime or client version",
    "settings": {
      "temperature": "value or runtime default"
    },
    "repository_commit": "40-character starting commit"
  },
  "cases": [
    {
      "id": "case ID from evals/trigger-evals.json",
      "prompt": "exact protected prompt",
      "decisions": [
        { "run": 1, "triggered": true, "observation": "exact routing observation" },
        { "run": 2, "triggered": true, "observation": "exact routing observation" },
        { "run": 3, "triggered": false, "observation": "exact routing observation" }
      ]
    }
  ]
}
```

Include every protected case exactly once. Keep `environment` identical in both files. The only intended change is the `change-review` description.

## skill-record.md

- Skill-creator source URL.
- Source commit as a 40-character SHA.
- Installed `SKILL.md` path.
- Installed `SKILL.md` SHA-256.
- Installation command or method.

## trigger-analysis.md

For the training split, list false-positive and false-negative case IDs, explain the failed boundary, and state the description change made in response. Do not tune against held-out wording.

## comparison.md

Record the before and after train accuracy, held-out accuracy, precision, recall, specificity, unanimous decision rate, false-positive IDs, and false-negative IDs. State whether the description should be adopted and why the comparison is fair.

## Required Run Files

- `evidence/before.md` records the starting commit, agent, model, runtime, settings, description hash, 60-decision result, and `evidence/before-results.json`.
- `evidence/before.patch` contains the original `change-review` skill snapshot as a genuine Git diff.
- `evidence/after.md` records the same conditions, final description hash, 60-decision result, and `evidence/after-results.json`.
- `evidence/after.patch` contains only the allowed description change and related evidence.
- `evidence/comparison.md` contains the generated before and after metrics and adoption decision.

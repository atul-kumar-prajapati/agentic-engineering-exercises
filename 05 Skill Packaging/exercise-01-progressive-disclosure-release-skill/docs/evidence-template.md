# Progressive Disclosure Release Skill Evidence

Replace every prompt with observed information. Do not infer resource access or verification results.

## before.md and after.md

- Agent: [name]
- Model: [model and version]
- Other tools: [enabled tools]
- Permissions: [permission mode]
- Time limit: [time limit]
- Prompt: Create customer release notes for `exercise-base..origin/exercise-head`. Trace every published item to Git, identify breaking and migration impact, report missing verification evidence, and exclude internal-only work.
- Repository commit: [40-character SHA]
- Attempt: 1
- Release-notes skill: [disabled or enabled]
- Input context: [exact files or skill path provided]
- Context bytes: [exact UTF-8 byte total from npm run context:measure]
- Output: [before-output.md or after-output.md]

Record files read, commands executed, decisions, verification results, and exit codes.

## skill-record.md

- Source: https://github.com/anthropics/skills/tree/main/skills/skill-creator
- Source commit: [40-character commit SHA]
- Installed path: [path ending in skill-creator/SKILL.md]
- SKILL.md SHA-256: [64-character hash]

## resource-usage.json

Create one object for each scenario in `docs/eval-scenarios.md`:

```json
{
  "scenarios": [
    {
      "id": "full-release",
      "prompt": "exact scenario prompt",
      "resources_read": ["references/publication-policy.md"],
      "context_files": ["SKILL.md", "references/publication-policy.md"],
      "context_bytes": {
        "SKILL.md": 1000,
        "references/publication-policy.md": 500
      },
      "total_context_bytes": 1500,
      "scripts_run": ["scripts/extract-release.mjs"],
      "reason": "why each loaded resource was needed",
      "output": "path to the saved output"
    }
  ]
}
```

Use skill-relative paths. Record only resources actually read or executed. Generate the byte values with `npm run context:measure -- <files>`; do not estimate them. Scripts are not context unless the agent read their source.

## eval-results.json

For every case in `evals/evals.json`, record the configuration, expectations passed, expectations total, output path, and observed evidence. Include trigger results for every query in `evals/trigger-evals.json`.

## comparison.md

Compare trigger decision, Git range selection, customer-item accuracy, breaking and evidence handling, internal exclusions, resources loaded, script reuse, verification score, and total skill context. Explain why the two primary runs were fair.

## Required Run Files

- `evidence/before.md` records the monolithic-prompt session, exact output path, resources read, commands, exit codes, and measured context bytes.
- `evidence/before.patch` contains the genuine Git diff for the first output and its evidence.
- `evidence/after.md` records the matching packaged-skill session and the full-release measured context bytes.
- `evidence/after.patch` contains the genuine Git diff for the skill-backed result.
- `evidence/comparison.md` compares accuracy, selective loading, extractor reuse, eval results, and context cost.

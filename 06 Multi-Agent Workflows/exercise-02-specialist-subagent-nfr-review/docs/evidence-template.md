# Specialist Review Evidence

Use 40-character Git SHAs, repository-relative source paths, exact commands, and captured outputs.

## review-cycle.json

```json
{
  "schema_version": 1,
  "baseline_sha": "40-character SHA",
  "remediation_sha": "40-character SHA",
  "performance": {
    "before_path": "evidence/performance-before.json",
    "before_sha256": "SHA-256",
    "after_path": "evidence/performance-after.json",
    "after_sha256": "SHA-256"
  },
  "specialists": [
    {
      "specialist": "security",
      "before": {
        "agent": "agent name",
        "session_id": "unique session ID",
        "reviewed_sha": "baseline SHA",
        "report_path": "evidence/specialists/security-before.md",
        "report_sha256": "SHA-256",
        "command": "npm run review:security",
        "exit_code": 1,
        "output_path": "evidence/commands/security-before.txt",
        "output_sha256": "SHA-256",
        "findings": [
          {
            "id": "SEC-01",
            "severity": "blocker",
            "path": "nfr-swarm-app/src/components/ReviewNote.tsx",
            "line": 1,
            "reproduction": "what was executed or inspected",
            "impact": "concrete user or system impact",
            "recommendation": "smallest verifiable fix"
          }
        ]
      },
      "after": {
        "agent": "agent name",
        "session_id": "new session ID",
        "reviewed_sha": "remediation SHA",
        "report_path": "evidence/specialists/security-after.md",
        "report_sha256": "SHA-256",
        "command": "npm run review:security",
        "exit_code": 0,
        "output_path": "evidence/commands/security-after.txt",
        "output_sha256": "SHA-256",
        "result": "pass"
      }
    }
  ]
}
```

Add accessibility, performance, and testability using their exact commands and paths. Before outputs must show the protected failure at the baseline SHA; after outputs must show a pass at the remediation SHA.

## decision-log.json

Record one decision per unique baseline finding and supplied `CLAIM-01` with `finding_id`, `decision`, `owner`, `rationale`, `verification`, and `residual_risk`. Also record `merge_decision`, `rollback`, the two SHAs, and the exact remediation paths relative to `nfr-swarm-app`.

Record the shared security-testability boundary in this form:

```json
"interactions": [
  {
    "finding_ids": ["SEC-02", "TEST-01"],
    "shared_path": "src/services/accessReviewApi.ts",
    "resolution": "how one boundary change addresses both findings",
    "verification_commands": ["npm run review:security", "npm run review:testability"],
    "residual_risk": "remaining interaction risk or none"
  }
]
```

## Performance

Run `npm run measure:performance -- --ref <SHA> --out <path>` at the baseline and remediation SHAs. Do not change sample size or iterations between measurements.

## Required Before and After Files

- `evidence/before.md` records the baseline SHA, four session IDs, finding counts, blocker counts, and baseline command results.
- `evidence/before.patch` is the genuine risky product diff reviewed by every specialist.
- `evidence/after.md` records the remediation SHA, four fresh session IDs, resolved blockers, remaining risks, performance, and command results.
- `evidence/after.patch` is the genuine remediation diff without evidence files.
- `evidence/comparison.md` compares findings, decisions, checks, performance, and merge readiness.

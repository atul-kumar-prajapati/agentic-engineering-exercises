# Superpowers Workflow Evidence

Record only the first attempt from each implementation session. Do not retry, correct, or rewrite either result. Use exact commits, commands, exit codes, counts, artifact paths, and skill names.

## `evidence/before.md`

### Run

- Starting commit:
- Implementation commit:
- Agent:
- Model:
- Tools:
- Permissions:
- Time limit:
- Attempt: 1
- Human hints: 0
- Superpowers available: No
- Prompt: Copy the production change exactly.
- Patch: `evidence/before.patch`

### Results

| Proof | Result |
|---|---|
| `npm run test:invitations` | Pass or fail; exit code: N |
| Invitation risks that failed | Number and names |
| Design created before code | Yes or No |
| Failing test recorded first | Yes or No |
| Review completed | Yes or No |
| Files changed | Number |
| Lines added and removed | `+N / -N` |

### Important Problems

List no more than three. Give the affected file and line and the failed invitation rule.

## `evidence/after.md`

### Run

- Starting commit:
- Implementation commit:
- Agent:
- Model:
- Tools:
- Permissions:
- Time limit:
- Attempt: 1
- Human hints: 0
- Superpowers available: Yes
- Prompt: Copy the production change exactly.
- Patch: `evidence/after.patch`

### Results

| Proof | Result |
|---|---|
| `npm run test:invitations` | Pass or fail; exit code: N |
| `npm run submission:verify` | Pass or fail; exit code: N |
| `npm run agent:check` | Pass or fail; exit code: N |
| Invitation risks that failed | Number and names |
| Files changed | Number |
| Lines added and removed | `+N / -N` |

### Workflow Artifacts

| Stage | Superpowers skill | Artifact or proof |
|---|---|---|
| Design | `superpowers:brainstorming` | Path and approval |
| Plan | `superpowers:writing-plans` | Path |
| Test first | `superpowers:test-driven-development` | `evidence/tdd.md` |
| Execution | Selected execution skill | Result |
| Review | `superpowers:requesting-code-review` | `evidence/review.md` |
| Verification | `superpowers:verification-before-completion` | Command result |

## `evidence/skill-usage.md`

- Superpowers version or commit:
- Design artifact: Repository-relative Markdown path
- Plan artifact: Repository-relative Markdown path
- Design approval: What was approved before planning

List the exact Superpowers skills in the order used, their purpose, and their output.

## `evidence/tdd.md`

Use `## Red` followed by `## Green`. Include the exact `npm run test:invitations` command, unedited output, and exit code for both results.

## `evidence/review.md`

For every finding, record severity, file and line, resolution, and verification. Use `No findings` only if the recorded review returned none.

## `evidence/comparison.md`

### Fair Comparison

Confirm the same starting commit, production change, agent, model, tools, permissions, time limit, human hints, and first-attempt condition.

### Results

Compare authorization, duplicate emails, guest policy, expiry, acceptance and revocation, state mutation, planning quality, tests, and final verification.

### Conclusion

State whether the skill-driven workflow improved the result. Support the answer with the measured results and both patches.

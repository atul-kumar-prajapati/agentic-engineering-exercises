# Agent Onboarding Evidence

Record only the first attempt from each agent session. Do not retry, correct, or rewrite the agent's implementation. Use exact commits, commands, exit codes, counts, and file paths instead of long explanations.

## `evidence/before.md`

### Run

- Starting commit:
- Implementation commit:
- Agent and model:
- Tools and permissions:
- Time limit:
- Human hints: 0
- Retries: 0
- Onboarding available: No
- Patch: `evidence/before.patch`

### Results

| Proof | Result |
|---|---|
| `npm run agent:check` | Pass or fail; exit code: N |
| `npm run verify:implementation` | Pass or fail; exit code: N |
| Files changed | Number |
| Lines added and removed | `+N / -N` |
| Unmet requirements | Failed checks or `None` |

### Problems Found

List no more than three important problems. Give the affected file and line for each one.

## `evidence/after.md`

### Run

- Starting commit:
- Implementation commit:
- Agent and model:
- Tools and permissions:
- Time limit:
- Human hints: 0
- Retries: 0
- Onboarding files read:
- Patch: `evidence/after.patch`

### Results

| Proof | Result |
|---|---|
| `npm run agent:check` | Pass or fail; exit code: N |
| `npm run verify:implementation` | Pass or fail; exit code: N |
| Files changed | Number |
| Lines added and removed | `+N / -N` |
| Unmet requirements | Failed checks or `None` |

### Onboarding Used

| Onboarding instruction | Resulting code or verification change |
|---|---|
| File and line | File and line |

## `evidence/comparison.md`

### Fair Comparison

| Condition | Before | After | Same? |
|---|---|---|---|
| Starting commit | | | Yes or No |
| Production change | | | Yes or No |
| Agent and model | | | Yes or No |
| Tools and permissions | | | Yes or No |
| Time limit | | | Yes or No |
| Human hints | | | Yes or No |
| Retries | | | Yes or No |

### Results

| Metric | Before | After |
|---|---|---|
| Application check | | |
| Implementation check | | |
| Failed requirements | | |
| Files changed | | |
| Lines added and removed | | |

### Conclusion

State whether the onboarding improved the result. Support the answer with the results table and the two patches.

# Handoff Skill Incident Rescue Evidence

Copy the relevant section into each evidence file and replace every prompt with observed information. Do not report a command as passing unless its captured output proves it.

## before.md and after.md

- Agent: [name]
- Model: [model and version]
- Tools: [enabled tools]
- Permissions: [permission mode]
- Time limit: [implementation time limit]
- Prompt: Complete the automatic escalation fix for at-risk cases. Use the current SLA rules, preserve existing ownership and manual escalation behaviour, and keep the queue totals and saved workflow state consistent.
- Attempt: 1
- Context source: [raw session history or generated handoff]
- Handoff skill: [disabled or enabled]

### Investigation

Record which files the agent treated as authoritative and which contradictions it noticed.

### Decisions and implementation

Record the requirements the agent followed, the files it changed, and the assumptions it made.

### Verification

Record each command, exit code, and relevant output.

## handoff-audit.md

### Verified facts retained

For every retained fact, provide the fact, its authoritative source path, and how it was verified.

### Outdated or unsupported claims excluded

For every excluded claim, provide the claim, where it appeared, and the evidence showing why it must not guide the next agent.

### Handoff boundary

Confirm what the fresh implementation agent received and that the raw session history was not provided.

## comparison.md

Compare requirement selection, implementation correctness, protected behaviour, verification, and context size. Explain why the two implementation runs were fair.

# TDD Skill Network Boundary Rescue Evidence

Replace every prompt with observed information. Do not report a command as passing unless captured output proves it.

## before.md and after.md

- Agent: [name]
- Model: [model and version]
- Other tools: [enabled tools excluding the TDD skill]
- Permissions: [permission mode]
- Time limit: [implementation time limit]
- Prompt: Repair the case dashboard test-first. Prove loading, success, server-empty, filtered-empty, request error, and retry recovery through GET /api/cases. Make the network test boundary strict and isolated.
- Attempt: 1
- TDD skill: [disabled or enabled]

### Investigation and decisions

Record the public seam, files inspected, assumptions, implementation order, and changed files.

### Verification

Record every command, exit code, and relevant output.

## skill-record.md

- Source: https://github.com/mattpocock/skills/tree/main/skills/engineering/tdd
- Install command: npx skills add mattpocock/skills --skill tdd
- Source commit: [40-character commit SHA]
- Installed path: [path ending in tdd/SKILL.md]
- SKILL.md SHA-256: [64-character file hash]

## tdd-cycles.md

For Cycle 1 Loading, Cycle 2 Filtered-empty, and Cycle 3 Retry, record:

- Public seam and one behaviour.
- Red test and test-only diff.
- Red command, exit code `1`, and relevant failure.
- Smallest production or harness change.
- Green command, exit code `0`, and relevant result.

End with a final review or refactor entry and its passing command.

## network-boundaries.md

Map loading, success, server-empty, filtered-empty, request error, retry, strict unhandled requests, and handler reset to exact files, tests, network handlers, user actions, and assertions.

## comparison.md

Compare the public seam, implementation order, observed red failures, production-change timing, network isolation, behaviour coverage, verification results, and changed files. Explain why the runs were fair and what the skill changed.

## network-run.txt

Capture `npm run test:network`, all configured shuffle seeds, the final summary, and `Exit code: 0`.

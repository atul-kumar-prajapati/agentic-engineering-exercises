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
- Smallest production or harness change.
- The matching cycle records in `tdd-commands.jsonl` and what the captured failure and pass prove.

End with a final review or refactor entry and its passing command. Do not copy command output into this document.

## tdd-commands.jsonl

Use `npm run evidence:capture` for every red and green command. The supplied wrapper records the cycle, phase, UTC time, exact command, repository commit, working-tree hash, stdout, stderr, duration, exit code, and record hash. It returns the original command's exit code, so it cannot manufacture a red or green result.

Use one append-only file. Do not edit its records manually. The submission verifier checks the hashes, timestamps, exit codes, and red-before-green order for all three cycles.

## network-boundaries.md

Map loading, success, server-empty, filtered-empty, request error, retry, strict unhandled requests, and handler reset to exact files, tests, network handlers, user actions, and assertions.

## comparison.md

Compare the public seam, implementation order, observed red failures, production-change timing, network isolation, behaviour coverage, verification results, and changed files. Explain why the runs were fair and what the skill changed.

## network-run.txt

Capture `npm run test:network`, all configured shuffle seeds, the final summary, and `Exit code: 0`.

## Required Run Files

- `evidence/before.md` and `evidence/after.md` record matching session conditions, exact command exit codes, behavior counts, files changed, and lines added and removed.
- `evidence/before.patch` and `evidence/after.patch` are genuine Git diffs from the two first attempts.
- `evidence/comparison.md` compares the observed red-green order, network isolation, six behaviors, and final checks.

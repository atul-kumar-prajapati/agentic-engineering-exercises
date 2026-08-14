# Verification Skill Workflow Gate Evidence

Replace every prompt with observed information. Do not report a command as passing unless the captured output and exit code prove it.

## before.md and after.md

- Agent: [name]
- Model: [model and version]
- Other tools: [enabled tools excluding the Verification Before Completion skill]
- Permissions: [permission mode]
- Time limit: [implementation time limit]
- Prompt: Audit the previous release claim, repair the workflow decision boundary, and create one fail-closed command that proves the client contract, client build, complete provider behavior, provider build, and gate failure handling.
- Attempt: 1
- Verification Before Completion skill: [disabled or enabled]

Record files inspected, claim audit, proof plan, implementation decisions, changed files, and every verification command with its exit code.

## skill-record.md

- Source: https://github.com/obra/superpowers/tree/main/skills/verification-before-completion
- Install command: `npx skills add obra/superpowers --skill verification-before-completion`
- Source commit: [40-character commit SHA]
- Installed path: [path ending in verification-before-completion/SKILL.md]
- SKILL.md SHA-256: [64-character file hash]

## claim-audit.md

Record the previous command and observed exit code. Separate what the focused provider test proves from the client contract, complete provider suite, builds, transition behavior, and gate behavior it does not prove.

## verification-plan.md

For every client, provider, and release-gate requirement, record the exact command or test, observable assertion, expected result, and failure meaning. State the gate order and why the first failure stops later steps.

## gate-contract.txt

Capture `npm run test:gate`, the success-path result, the non-zero-step result, the spawn-error result, and `Exit code: 0`.

## final-verification.txt

- Implementation commit: [40-character SHA containing all source, test, and gate changes]
- Date: [ISO-8601 timestamp with timezone]
- Command: `node scripts/verification-gate.mjs`
- Working tree: [clean before the run, excluding evidence-only files]

Paste the relevant unedited output for all four gate steps, the final verified message, and `Exit code: 0`. Evidence may be committed afterward without changing the verified implementation files.

## comparison.md

Compare claim coverage, commands selected, failure handling, runtime-boundary checks, freshness of evidence, completion wording, verification results, and changed files. Explain why the runs were fair and what the skill changed.

## Required Run Files

- `evidence/before.md` and `evidence/after.md` record matching session conditions, exact claim and command results, files changed, and lines added and removed.
- `evidence/before.patch` and `evidence/after.patch` are genuine Git diffs from the two first attempts.
- `evidence/comparison.md` connects every claimed improvement to fresh gate output and the two patches.

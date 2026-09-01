# After Attempt — Characterization-First Policy Extraction (Exercise 11.3)

The characterization-first run: a fresh agent session, matched to the unconstrained run on agent, model, tools, permissions, request, and time limit, whose only extra input was the exercise's own rules contract, case table, protected observations, and test-first history.

- Starting commit: `52090edddf032d026ece16ef90feb627bf8e67ac`
- Implementation commit: `45238cc3d7c484720c5d9bbece5cbb31cb593bd0`
- Agent and model: Cursor subagent cursor-grok-4.6-high
- Tools and permissions: file read/write and bash (git, java, mvn, node, npm); dedicated isolated Git worktree; no network required for the extraction
- Time limit: 45 minutes
- Human hints: 0
- Retries: 0
- Patch SHA-256: `9f4829bef4321c35e6ed382618a0c38a336e5d4278606a7419d018dc2141497a`
- Patch path: evidence/after.patch
- Backend contract result: `./mvnw test` exit 0 (15 tests, 0 failures) — re-run by the integration owner
- Client contract result: `npm run test:rules` exit 0 (`PASS backend architecture, behavior, HTTP JSON, and client contract`)
- Exception-order differences: none vs protected observations
- JSON differences: none; `evidence/contract-after.json` JSON.stringify-equals `docs/contract-observations.json`
- Rejected-state mutations: none; Ready length 11 leaves the repository item equal and save count 0
- Save-count differences: none; length 12, unknown status, and Blocked each save once
- Files changed vs starting commit: participant test, `contract-before.json`, `DecisionPolicy.java`, `WorkflowService.java`
- Lines added and removed: 130 added, 3 removed (`git diff --numstat` 6/0, 14/0, 9/3, 101/0)

## What the run received, and what it did not

The after run received the team's request (identical intent to the unconstrained run) plus the repo's own contracts as its only extra input: `README.md`, `docs/rules-contract.md`, `docs/legacy-case-table.md`, `docs/contract-observations.json`, existing tests, and the verifier scripts.

It did not receive the previous implementation, `before.patch`, or any explanation of the first attempt. The before branch lived in `/tmp/ex-11-03-before`, a worktree it never saw.

## What the agent did (its own report, verified by me)

Two commits on `codex/exercise-11-03-legacy-rules-engine-untangle-after`, fast-forwarded onto the exercise branch:

1. Characterization `e73626090569a3107739dbb599ec5f19ced369e4` — only `WorkflowPolicyCharacterizationTest.java` (five Given-When-Then cases, 3994 characters) and `evidence/contract-before.json` (byte-identical to `docs/contract-observations.json`).
2. Refactor `45238cc3d7c484720c5d9bbece5cbb31cb593bd0` — only `DecisionPolicy.java` and `WorkflowService.java`.

`DecisionPolicy.validate(WorkflowItem, WorkflowDecision)` owns the Ready rule. `WorkflowService` looks up, validates, constructs, and saves. One-arg and `@Autowired` two-arg constructors both exist. `WorkflowService` contains neither `"Ready".equals` nor the Ready error string.

Blobs at the refactor commit: DecisionPolicy `88bcb9eb`, WorkflowService `4b990108`. `after.patch` is `git diff --binary --full-index` from the starting commit to this implementation commit (the unaided after-branch tip). Integration did not edit those two production files after the agent committed them.

## Verification of the attempt (integration owner, re-derived)

Citation tree: working tree `/tmp/ex-11-03` / refactor commit `45238cc` Java blobs. Protected tests and `docs/contract-observations.json` are the `upstream/main` copies at `52090ed`. No bundle.

- `git diff-tree --name-only -r e736260` — exactly the participant test and `contract-before.json`.
- `git diff-tree --name-only -r 45238cc` — exactly `DecisionPolicy.java` and `WorkflowService.java`.
- `./mvnw test` — exit 0, Tests run: 15. Breakdown counted from `@Test`: `WorkflowServiceTest` 2, `WorkflowPolicyCharacterizationTest` 5, `WorkflowApiContractTest` 3, `WorkflowContractCharacterizationTest` 5.
- `npm run test:rules` — exit 0.
- `JSON.stringify` equality: contract-before, contract-after, and `docs/contract-observations.json` match.

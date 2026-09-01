# Contract-behavior handoff

Lane: five legacy cases, HTTP, client parser. Reviewer: Cursor subagent `cursor-grok-4.6-high`. Read-only. Citation tree: working tree `/tmp/ex-11-03` (protected tests = `upstream/main` at `52090ed`; service/policy = refactor `45238cc`). Integration owner re-derived every line and shifted citations from `@Test` annotations to method bodies (off-by-one vs the reviewer table).

**Verdict: PASS.** Independently re-ran `./mvnw test` exit 0 (15 tests) and `npm run test:rules` exit 0. `@Test` count re-counted: participant 5, protected characterization 5, service 2, HTTP 3 = 15.

| Case | Result | Proving test (method body) | Saves | Disposition |
|---|---|---|---|---|
| 1. Missing ID + invalid Ready | Not found precedes policy | `WorkflowPolicyCharacterizationTest.java:20-30`; duplicate `WorkflowContractCharacterizationTest.java:46-52` | 0 (`:30`, `:52`) | **accept** (holds) |
| 2. Ready note length 11 | Exact invalid message; item equal; zero saves | `WorkflowPolicyCharacterizationTest.java:34-46`; duplicate `WorkflowContractCharacterizationTest.java:22-32` | 0 | **accept** (holds) |
| 3. Ready note length 12 | Accepted `wf-101` Atlas Co / 91 / `123456789012` | `WorkflowPolicyCharacterizationTest.java:50-61`; duplicate `WorkflowContractCharacterizationTest.java:36-42` | 1 | **accept** (holds) |
| 4. Unknown `Escalated Later` | Accepted; Ready-only gap at `DecisionPolicy.java:8-9` | `WorkflowPolicyCharacterizationTest.java:65-78`; duplicate `WorkflowContractCharacterizationTest.java:56-61` | 1 | **accept** (holds) |
| 5. Valid Blocked | id/customer/score preserved; status/owner/note replaced | `WorkflowPolicyCharacterizationTest.java:82-99`; HTTP `WorkflowApiContractTest.java:20-30`; weaker `WorkflowServiceTest.java:19-26` | 1 (`:99`) | **accept** (holds) — snapshot omits this row; harness limit |

HTTP 202 six-field JSON: `WorkflowApiContractTest.java:20-30`. HTTP 400 exact error object: `:33-43`. HTTP 404: `:46-56`. Client parser: `workflowDecisionContract.mjs:1-16` and `run-client-contract.mjs:4-16`.

| id | claim | disposition |
|---|---|---|
| C1 | Snapshot has 4 cases; brief has 5 | **dismiss** — harness limit; Blocked proved by tests above |
| C2 | `isEqualTo` is not a byte dump | **dismiss** — `WorkflowItem` is a 6-field record (`WorkflowItem.java:3-9`); component equality + zero saves is the observable equivalent |
| C3 | `WorkflowServiceTest` omits exact message and save count | **dismiss** — characterization + HTTP cover the contract |
| C4 | Escalated Later note is length 26, so the test does not isolate Ready-only length skip | **dismiss** — residual of the fixture, not a broken case; the gap is in `DecisionPolicy.java:8-9` |
| C5 | Parser accepts any 2xx | **dismiss** — HTTP tests pin 202; parser contract is key-set + error string |
| C6 | Sandbox Maven Mockito attach failure | **dismiss** — environment; unsandboxed run exit 0 |

No production edits from this lane.

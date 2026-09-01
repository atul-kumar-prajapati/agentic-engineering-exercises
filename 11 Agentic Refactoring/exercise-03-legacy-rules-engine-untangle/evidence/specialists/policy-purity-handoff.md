# Policy-purity handoff

Lane: policy architecture. Reviewer: Cursor subagent `cursor-grok-4.6-high`. Read-only. Citation tree: working tree `/tmp/ex-11-03` Java after refactor `45238cc` (no bundle). Integration owner re-derived every file:line before accepting.

**Verdict: PASS.** No accept findings. Three dismissals.

| id | severity | file:line | claim | disposition |
|---|---|---|---|---|
| P1 | nit | `DecisionPolicy.java:7` | `validate(WorkflowItem item, WorkflowDecision decision)` never reads `item`; Ready rule uses `decision` only (`DecisionPolicy.java:8-9`). | **dismiss** — rules-contract requires validating the supplied item and decision, not inspecting the item. Unused `item` does not add a repository or return a replacement. Re-derived: `item` is in the signature at `:7`; `"Ready".equals` at `:9`; throw at `:11`. |
| P2 | nit | `WorkflowService.java:12-14` | 1-arg ctor does `this(repository, new DecisionPolicy())`. | **dismiss** — required so protected `WorkflowContractCharacterizationTest.java:24` and `WorkflowServiceTest.java:12` still compile. Spring uses `@Autowired` two-arg (`WorkflowService.java:16-20`). |
| P3 | residual | `WorkflowContractCharacterizationTest.java:65-72` | Architecture test does not assert void return, 1-arg ctor, or absence of `.save(` in policy source. | **dismiss** — production types already satisfy those checks (`DecisionPolicy.java:6-14`, `WorkflowService.java:10-20`). Out of write scope (protected test). |

Clean (re-derived): policy has no fields and no `.save(`/`.findById(`; Ready rule at `DecisionPolicy.java:9,11`; lookup `WorkflowService.java:27-28` then `validate` at `:30` then `save` at `:32`; no `"Ready".equals` in `WorkflowService.java:1-40`.

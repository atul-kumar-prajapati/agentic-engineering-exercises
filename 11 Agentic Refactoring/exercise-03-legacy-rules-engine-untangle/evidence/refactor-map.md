# Refactor map — lookup, validation, construction, persistence

Citation tree: working-tree Java at `/tmp/ex-11-03` after refactor commit `45238cc3d7c484720c5d9bbece5cbb31cb593bd0`. No Git bundle. Protected tests are the checked-in files (identical to `upstream/main` at `52090ed`).

## What moved, and what stayed

| Concern | Owner after extraction | Source |
|---|---|---|
| Lookup | `WorkflowService` | `WorkflowService.java:27-28` — `repository.findById(id).orElseThrow(...)` runs before any policy call |
| Validation | `DecisionPolicy` | `DecisionPolicy.java:7-12` — `validate(WorkflowItem, WorkflowDecision)` owns `"Ready".equals` and throws `InvalidWorkflowDecisionException` with `Ready decisions require a longer evidence note` |
| Construction | `WorkflowService` | `WorkflowService.java:32-38` — `new WorkflowItem(item.id(), item.customer(), decision.status(), item.score(), decision.owner(), decision.evidenceNote())` |
| Persistence | `WorkflowService` | `WorkflowService.java:32` — a single `repository.save(...)` after validation returns |

`DecisionPolicy` is a Spring `@Component` (`DecisionPolicy.java:5`) with no `WorkflowRepository` field and no `.save(` / `.findById(` calls. `WorkflowService` keeps a `DecisionPolicy` field (`WorkflowService.java:10`) and two constructors: the one-arg constructor at `WorkflowService.java:12-14` delegates with `new DecisionPolicy()` so existing `WorkflowServiceTest` still compiles; the `@Autowired` two-arg constructor at `WorkflowService.java:16-20` is what the HTTP slice uses.

## Order that must not move

1. Lookup (`WorkflowService.java:27-28`). A missing id throws `WorkflowNotFoundException` even when the Ready note is invalid — proved by `WorkflowPolicyCharacterizationTest.java:20-30` and protected `WorkflowContractCharacterizationTest.java:46-52`.
2. Validation (`WorkflowService.java:30` → `DecisionPolicy.validate`). Ready notes shorter than 12 characters fail here; length 12 is accepted (`DecisionPolicy.java:8-9`).
3. Construction + one save (`WorkflowService.java:32-38`). Rejection never reaches this line, so save count stays zero (`WorkflowPolicyCharacterizationTest.java:45-46`).

Unknown non-Ready statuses such as `Escalated Later` are not validated by `DecisionPolicy`; that gap stays in the policy by omission, not by a new allow-list.

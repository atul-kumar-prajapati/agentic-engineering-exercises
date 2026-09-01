# Rollback — restore the pre-extraction service contract

If `DecisionPolicy` or the focused `WorkflowService` wiring has to come out, revert the refactor commit and keep the characterization safety net.

## Revert the production extraction

```
git revert 45238cc3d7c484720c5d9bbece5cbb31cb593bd0
```

That commit touches only `DecisionPolicy.java` and `WorkflowService.java`. Reverting it restores inlined Ready validation inside `WorkflowService.decide`, removes the policy type, and restores the original one-arg constructor shape. The participant test `WorkflowPolicyCharacterizationTest.java` and `evidence/contract-before.json` remain, so the contract can still be re-run against the restored service.

Do **not** revert `e73626090569a3107739dbb599ec5f19ced369e4` unless the characterization itself is wrong. Dropping the test also drops the before snapshot.

## Contract and repository checks after revert

1. `./mvnw test` in `legacy-rules-api` — protected HTTP JSON, protected characterization, and `WorkflowServiceTest` must still pass. After revert, `WorkflowContractCharacterizationTest.decisionPolicyExistsIsRepositoryFreeAndIsInjectedIntoService` will fail (it requires `DecisionPolicy`); that failure is the signal the extraction is gone, not a reason to edit the protected test.
2. Compare repository effects: rejection must perform zero `save` calls; acceptance must save once. `RecordingRepository` in the participant test is the seam.
3. Confirm the HTTP contract: 202 six-field JSON, 400 `{ "error": "Ready decisions require a longer evidence note" }`, 404 `{ "error": "Workflow item not found: missing" }`.

A revert of the refactor commit is sufficient to put validation back inside `WorkflowService`. Recreating `DecisionPolicy` later must again be a two-file commit after the characterization ancestor.

# Before Attempt — Unconstrained Policy Extraction (Exercise 11.3)

The unconstrained run: a fresh coding agent received the team's extraction request cold, with every exercise contract withheld, and its uncorrected first attempt was recorded.

- Starting commit: `52090edddf032d026ece16ef90feb627bf8e67ac`
- Implementation commit: `ab44994189b813ebcfc7ae25399541ec5d5851e2`
- Agent and model: Cursor subagent cursor-grok-4.6-high
- Tools and permissions: file read/write and bash (git, java, mvn, node, npm); dedicated isolated Git worktree; no network required for the extraction
- Time limit: 45 minutes
- Human hints: 0
- Retries: 0
- Patch SHA-256: `4b6a71350fdaf2c42352a4ea557bb8defea616d5f701061d24f92d81fd9bb5e9`
- Patch path: evidence/before.patch
- Backend contract result: `./mvnw test` exit 1 (testCompile; 6 constructor-arity errors)
- Client contract result: not reached (backend tests did not compile)
- Exception-order differences: none observed in `decide` source; lookup still precedes `DecisionPolicy.validate`
- JSON differences: production `decide` still constructs the same six-field `WorkflowItem`; HTTP tests did not compile so 202/400/404 JSON was not re-executed on this commit
- Rejected-state mutations: Ready-length check still throws before `save`; zero-save-on-reject remains in source
- Save-count differences: acceptance still has one `repository.save` in `WorkflowService.decide`
- Files changed: `legacy-rules-api/src/main/java/dev/agentic/exercise/workflow/DecisionPolicy.java` (added) and `WorkflowService.java` (modified)
- Lines added and removed: 16 added, 4 removed (`git diff --numstat`: DecisionPolicy 12/0, WorkflowService 4/4)

## What the run received

Only the team's extraction request, in a sparse Git worktree exposing **only** `legacy-rules-api/src/main`, `pom.xml`, and `mvnw`. It did not receive the exercise README, `docs/rules-contract.md`, `docs/legacy-case-table.md`, `docs/contract-observations.json`, the evidence template, `legacy-rules-app`, any test sources, or the characterization-first commit sequence.

## What the agent did (its own tree, verified by me)

It added `@Component class DecisionPolicy` with `validate(WorkflowDecision)` owning `"Ready".equals` and the exact Ready error text, and rewired `WorkflowService.decide` to look up, validate, then construct-and-save. It kept a single two-arg constructor `WorkflowService(WorkflowRepository, DecisionPolicy)` and dropped the original one-arg constructor. `DecisionPolicy` has no repository field.

## Verification of the attempt (integration owner, re-derived)

Citation tree for this run: commit `ab44994` blobs, evaluated in a full (non-sparse) checkout of that commit at `/tmp/ex-11-03-before-eval` after `git sparse-checkout disable`. Not a bundle.

- `git diff --name-status 52090ed ab44994` — exactly two files (DecisionPolicy added, WorkflowService modified). Tree file count 1418 vs start 1417 (one new file; no sparse-tree deletion).
- `./mvnw test` in `legacy-rules-api` — exit 1. Six testCompile errors, all the same defect: `WorkflowService` cannot be applied to a single `WorkflowRepository` argument. Protected `WorkflowContractCharacterizationTest.java:24`, `:38`, `:48`, `:58` and `WorkflowServiceTest.java:12`, `:21` still call the one-arg constructor.
- `decide` still looks up first (`WorkflowService.java:21-22` on the before blob), then `decisionPolicy.validate(decision)` (`:24`), then one `save` (`:26-32`). Ready validation still uses length `< 12` and the exact exception text in `DecisionPolicy.java:8-9`.
- `validate` takes only `WorkflowDecision`, not the looked-up item. Observable Ready/unknown-status behavior in source matches the start; the compile break is the constructor seam, not a changed exception message.

The extraction happened to preserve `decide`'s control flow. Nothing in its environment would have caught the missing one-arg constructor, because the protected tests were not in the sparse checkout.

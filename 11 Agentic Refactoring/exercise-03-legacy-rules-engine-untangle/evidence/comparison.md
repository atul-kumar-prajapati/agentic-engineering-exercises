# Comparison — Unconstrained vs Characterization-First (Exercise 11.3)

## Same conditions

Both attempts ran as fresh Cursor subagents on `cursor-grok-4.6-high`, in dedicated isolated Git worktrees from the same starting commit `52090edddf032d026ece16ef90feb627bf8e67ac`, with identical tools and permissions (file read/write and bash covering git, java, mvn, node, npm; dedicated worktree; no network required for the extraction), the identical team request to extract decision validation into `DecisionPolicy` without changing observable behavior, a 45-minute time limit, zero human hints, and a genuine first-attempt patch each (`Human hints: 0`, `Retries: 0` in both `before.md` and `after.md`).

The single independent variable is the workflow input. The before run received only the request, in a sparse checkout exposing nothing but production Java. The after run received the same request plus the repo's own contracts (rules-contract, legacy-case-table, contract-observations, existing tests, verifier scripts). The after run did not receive the previous implementation, `before.patch`, or any explanation of the first attempt — the before attempt lived in `/tmp/ex-11-03-before`, a worktree it never saw.

## Before

The unconstrained attempt (`ab44994`, patch SHA-256 `4b6a7135…`) extracted a repository-free `DecisionPolicy` and preserved `decide` lookup → validate → one save. It also dropped the one-arg `WorkflowService(WorkflowRepository)` constructor, so the protected characterization tests and `WorkflowServiceTest` no longer compile (`./mvnw test` exit 1, 6 constructor-arity errors at `WorkflowContractCharacterizationTest.java:24,:38,:48,:58` and `WorkflowServiceTest.java:12,:21` on the full checkout of `ab44994`). `validate` takes only `WorkflowDecision`, not the looked-up item. There was no characterization commit, no snapshot, and no gate in its environment that could have failed the constructor seam.

## After

The characterization-first attempt (`45238cc`, patch SHA-256 `9f4829be…`) committed the five-case participant test and `contract-before.json` first (`e736260`), then extracted `DecisionPolicy` and updated only `WorkflowService` (`45238cc`). It kept the one-arg constructor (`WorkflowService.java:12-14`) and the `@Autowired` two-arg constructor (`WorkflowService.java:16-20`). `./mvnw test` exit 0 (15 tests). `npm run test:rules` exit 0. Before/after snapshots JSON.stringify-equal `docs/contract-observations.json`.

Lookup, exception text, HTTP fields, client parser, rejected-state immutability, and save counts are unchanged vs the protected observations. The fifth brief case (valid Blocked decision) is not in `contract-observations.json`; it is proved by `WorkflowPolicyCharacterizationTest.java:82-99` and protected `WorkflowApiContractTest.java:20-30`.

## Proof

- Starting commit `52090edddf032d026ece16ef90feb627bf8e67ac`; before implementation `ab44994189b813ebcfc7ae25399541ec5d5851e2`; characterization `e73626090569a3107739dbb599ec5f19ced369e4`; refactor / after implementation `45238cc3d7c484720c5d9bbece5cbb31cb593bd0`.
- `evidence/before.patch` (2649 bytes, SHA-256 `4b6a71350fdaf2c42352a4ea557bb8defea616d5f701061d24f92d81fd9bb5e9`) and `evidence/after.patch` (8929 bytes, SHA-256 `9f4829bef4321c35e6ed382618a0c38a336e5d4278606a7419d018dc2141497a`) are the exact `git diff --binary --full-index <starting> <implementation>` of their runs, differ from each other, and both apply cleanly to the starting commit.
- Backend on the before commit — exit 1 (testCompile). Backend and client on the after commit — exit 0. Snapshot hashes match the protected observations.

## Conclusion

Under matched conditions, both agents extracted a pure Ready-length policy and left `decide`'s lookup/save order intact. Only the characterization-first run *binds* that claim: a pre-committed five-case test, identical contract snapshots, a two-file refactor commit, a one-arg constructor the existing tests still call, and verifier-enforced history. The unconstrained run's behavioral source was mostly right and still unmergeable, because dropping the constructor seam is invisible without the tests it never saw. That difference, not a changed Ready message, is the finding.

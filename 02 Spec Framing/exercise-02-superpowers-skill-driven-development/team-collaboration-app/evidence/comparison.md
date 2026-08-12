# Before and After Comparison

## Fairness of conditions

Both runs used Codex with GPT-5, the same PowerShell/apply-patch/Git tool environment, the same managed workspace permissions, a 60-minute limit, attempt 1, the same starter commit, and the exact supplied feature request. The intentional independent variable was whether the repository-local Superpowers skills governed the workflow.

The before implementation is preserved in `evidence/before.patch` and commit `c2c2a13` on `codex/exercise-02-02-without-superpowers`. The after implementation and chronological workflow commits are preserved on `codex/exercise-02-02-with-superpowers`.

## Behavioral comparison

| Risk or workflow area | Without Superpowers | With Superpowers |
| --- | --- | --- |
| Authorization and workspace policy | The service correctly checks active status and `inviteRoles`, but the UI fixes the actor to owner `USR-201`, so unauthorized paths cannot be exercised visibly. | `superpowers:brainstorming` made authorization an explicit design invariant. The UI exposes an actor selector, and supplemental tests cover an active admin excluded by `inviteRoles`. |
| Case-insensitive duplicate email handling | The implementation normalizes member and pending-invitation comparisons and adds an acceptance-time existing-email rejection. | The approved design specifies normalization before storage and comparison. Supplied tests verify existing members, pending invitations, and replacement after expiry without adding behavior outside the contract. |
| Guest policy | Guest creation is rejected in the service and the UI disables the guest option while policy disallows it. | The service enforces the same policy, while tests additionally demonstrate that an allowed guest invitation becomes an active guest when accepted. |
| Expiry | Expiry uses UTC date arithmetic and treats equality as expired through `isUnexpired`. It passed the supplied expiry tests. | `superpowers:writing-plans` documented the exact `expiresAt <= now` boundary and millisecond calculation before implementation; Red/Green evidence and final verification cover it. |
| Single-use acceptance and revocation | The service rejects finalized invitations and passes supplied lifecycle tests, but the UI exposes revocation only and has no Accept control. | The UI demonstrates create, accept, and revoke through the shared service. Independent review added direct accepted-invitation revocation coverage. |
| Rejected-state safety | The implementation returns the original state and performs validation before successful array construction. Supplied tests check unchanged values. | `superpowers:test-driven-development` and code review made rejection identity explicit; supplemental tests assert the exact original state object is returned. |
| Scope and architecture | Service helpers are reasonably separated, but there is no approved design explaining validation order or boundaries. | `superpowers:brainstorming` compared three architectures and captured the approved pure-function design before planning or code. |
| Planning quality | No written plan or implementation checkpoints exist; the service and UI appeared in one working-tree diff. | `superpowers:writing-plans` produced an executable task plan committed before the failing-test and implementation commits. |
| Testing approach | No failing test was recorded before production code. Existing tests were run only after the implementation was preserved. | `superpowers:test-driven-development` recorded a genuine Red result before production code and Green output afterward. Three supplemental review tests protect risks beyond the supplied suite. |
| Review | No independent review artifact or resolution loop exists. | `superpowers:requesting-code-review` dispatched an independent reviewer, and `superpowers:receiving-code-review` validated and resolved findings with verification. |
| Final verification | `npm run test:invitations` and `npm run agent:check` passed after implementation. | `superpowers:verification-before-completion` required fresh focused tests, supplemental tests, submission verification, and the complete agent pipeline after evidence assembly. |

## Outcome

Both implementations satisfy the supplied backend contract tests. The clearest Superpowers effect is therefore not merely whether the code works: it is the chronological, reviewable chain from approved design to plan, Red/Green TDD, implementation checkpoints, independent review, risk-specific supplemental tests, and final verification. It also produced a more complete demonstration UI by exposing actor selection and invitation acceptance.

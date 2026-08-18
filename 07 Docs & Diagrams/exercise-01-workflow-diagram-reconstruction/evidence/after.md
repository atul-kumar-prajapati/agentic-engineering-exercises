# Source-Led First Attempt

## Session Conditions

- Starting commit: `3761a42840cbbc4ee9143ecc914519b4f8c6cc0c`, identical to the before attempt
- Final diagram source SHA: `c72673b2cf45d21d29e7b21f5f5cd4de32b10c43`
- Branch: `codex/exercise-07-01-workflow-diagram-reconstruction`
- Input: the same three-diagram request, plus authority to inspect protected implementation, fixtures, UI behavior, contracts, and trace scripts
- Agent conditions: fresh Codex subagent, inherited model, standard workspace tools and permissions, one first attempt, no corrections, retries, or verifier-guided revision
- Time limit: 45 minutes; the attempt completed within the limit

## Result

Changed files: the three files under `diagrams/`. The required command `npm run workflow:trace && npm run diagrams:parse` was run once by the source-led agent and exited `0`; no diagram revisions followed.

Mermaid parser result: all three diagrams parsed with their expected types. Independent semantic review found all required aliases, conditions, actors, interactions, and marker cardinalities.

Unsupported state-transition count: **0**. Missing required scenario paths: **0**. All ten required edges appear in the state diagram and in their contract-required sequence diagrams.

## Preservation

`evidence/after.patch` is the genuine uncommitted Git diff of the source-led three-diagram first attempt. The diagrams were committed without revision as `c72673b2cf45d21d29e7b21f5f5cd4de32b10c43` before evidence was added.

## Post-Review Correction

The first attempt above is preserved unmodified in `evidence/after.patch` and in commit `c72673b2cf45d21d29e7b21f5f5cd4de32b10c43`. A later round-two specialist review found two defects the first attempt had missed, and the accountable integration owner corrected them in `63601a3662358da499f72118fd4d693bcfc530da`:

- The approval sequence left `Application->>PolicyEngine: Evaluate request risk` unanswered on the `else Normal risk` branch, so normal-risk routing was never attributed to the policy engine.
- The failure sequence carried `Application->>IdentityAdmin: Assign partial access removal` under `WF-09`, which no source line supports. `WF-09` only sets the identity provider to degraded at `src/workflow.tsx:129`; the identity admin first acts at `WF-10`.

The state diagram was not changed. `evidence/review-fixes.patch` is the genuine Git diff between the first attempt and the corrected diagrams, so both the unaided result and the reviewed result stay independently inspectable. The submitted `source_sha` is the corrected commit.

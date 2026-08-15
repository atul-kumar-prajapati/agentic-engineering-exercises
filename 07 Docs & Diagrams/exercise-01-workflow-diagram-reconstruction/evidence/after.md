# Source-Led First Attempt

## Session Conditions

- Starting commit: `3761a42840cbbc4ee9143ecc914519b4f8c6cc0c`, identical to the before attempt
- Final diagram source SHA: `c72673b2cf45d21d29e7b21f5f5cd4de32b10c43`
- Branch: `codex/exercise-01-workflow-diagram-reconstruction`
- Input: the same three-diagram request, plus authority to inspect protected implementation, fixtures, UI behavior, contracts, and trace scripts
- Agent conditions: fresh Codex subagent, inherited model, standard workspace tools and permissions, one first attempt, no corrections, retries, or verifier-guided revision
- Time limit: 45 minutes; the attempt completed within the limit

## Result

Changed files: the three files under `diagrams/`. The required command `npm run workflow:trace && npm run diagrams:parse` was run once by the source-led agent and exited `0`; no diagram revisions followed.

Mermaid parser result: all three diagrams parsed with their expected types. Independent semantic review found all required aliases, conditions, actors, interactions, and marker cardinalities.

Unsupported state-transition count: **0**. Missing required scenario paths: **0**. All ten required edges appear in the state diagram and in their contract-required sequence diagrams.

## Preservation

`evidence/after.patch` is the genuine uncommitted Git diff of the source-led three-diagram first attempt. The diagrams were committed without revision as `c72673b2cf45d21d29e7b21f5f5cd4de32b10c43` before evidence was added.

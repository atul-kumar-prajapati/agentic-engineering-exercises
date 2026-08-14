# Before: raw-prompt baseline

- Date: 2026-08-14
- Agent: Isolated Codex sub-agent
- Model: Codex (GPT-5)
- Tools and permissions: Read-only workspace access and non-mutating shell inspection
- Time limit: 10 minutes
- Exact release request: `Draft the release notes for exercise-base..origin/exercise-head using the supplied source inputs.`
- Attempt number: 1
- Skill: Disabled; `docs/monolithic-skill-draft.md` was injected as the raw operating prompt
- Input files provided: `docs/monolithic-skill-draft.md`, `docs/pr-descriptions.md`, `docs/ci-evidence.md`, and the materialized `fixtures/release-history.bundle`
- Git comparison: `exercise-base..origin/exercise-head`
- Output file: `evidence/before-output.md`
- Verification command: `npm run release:verify -- <materialized-repo> ../evidence/before-output.md`
- Verification result and exit code: Failed, exit code 1. The verifier first reported that the notes did not use the required `Missing evidence` wording. The draft also published internal telemetry and supplied no `- Trace:` lines.

The output is the agent's unedited first response.

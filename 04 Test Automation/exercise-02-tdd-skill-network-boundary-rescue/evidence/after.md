# After run: TDD skill enabled

- Agent: Codex desktop fresh task
- Model: Codex configured default model
- Other tools: Default Codex workspace tools (shell and apply_patch)
- Permissions: Managed workspace-write with restricted network and approval escalation
- Time limit: 45 minutes
- Prompt: Repair the case dashboard test-first. Prove loading, success, server-empty, filtered-empty, request error, and retry recovery through GET /api/cases. Make the network test boundary strict and isolated.
- Attempt: 1
- TDD skill: enabled

### Investigation and decisions

- Date: 2026-08-14.
- Public seam: the rendered dashboard UI backed only by the real `GET /api/cases` request, controlled with MSW; `fetch`, React state, and component internals were not mocked.
- Files inspected: the exercise README, approved network contract, evidence template, protected acceptance tests, dashboard, shared MSW setup and handlers, package scripts, and submission verifier.
- Implementation order: loading test then UI plus strict harness; filtered-empty test then copy fix; retry test then action wiring; independent success, server-empty, and request-error characterization checks; shuffled verification last.
- Changed files: `case-dashboard-app/src/App.network.test.tsx`, `case-dashboard-app/src/App.tsx`, `case-dashboard-app/src/test/setup.ts`, and the after-run evidence files.
- Protected challenge inputs and unrelated repository files were not changed.

### Verification

Commands used by this run:

- `npm run test:smoke`: exit code 0, 1 test passed.
- `npm run test:acceptance`: exit code 0, 3 tests passed after the repair.
- `npm run test:network`: exit code 0, seeds 104, 108, and 220 each passed 12 tests.
- `npm run test:tdd`: exit code 0; verifier reported 6 participant tests, strict MSW isolation, comparable first attempts, three ordered cycles, six states, and shuffled stability evidence.
- `npm run agent:check`: exit code 0; 21 protected inputs verified, then lint, repository checks, format, typecheck, and production build passed.

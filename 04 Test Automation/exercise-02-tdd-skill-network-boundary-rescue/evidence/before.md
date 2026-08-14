# Before run: TDD skill disabled

- Agent: Codex desktop fresh task
- Model: Codex configured default model
- Other tools: Default Codex workspace tools (shell and apply_patch)
- Permissions: Managed workspace-write with restricted network and approval escalation
- Time limit: 45 minutes
- Prompt: Repair the case dashboard test-first. Prove loading, success, server-empty, filtered-empty, request error, and retry recovery through GET /api/cases. Make the network test boundary strict and isolated.
- Attempt: 1
- TDD skill: disabled

### Investigation and decisions

- Task: `019fff5d-3972-7ed1-b754-d49b098a94cb`
- Observed duration: 798,635 ms (about 13 minutes 19 seconds).
- Public seam: the component's real `GET /api/cases` request, controlled through MSW rather than by mocking `fetch` or component internals.
- Files inspected: the exercise README and contract, `src/App.tsx`, the weak and acceptance tests, MSW handlers/server/setup, package scripts, and submission verifier.
- Implementation order: tightened the shared MSW setup while adding the first loading test; completed loading, filtered-empty, and retry as separate test and production changes; then added independent success, server-empty, and request-error checks.
- Changed files: `case-dashboard-app/src/App.network.test.tsx`, `case-dashboard-app/src/App.tsx`, and `case-dashboard-app/src/test/setup.ts`.
- The agent left protected challenge inputs and unrelated repository files unchanged.

### Observations

- The run identified the public request seam and used user-visible Testing Library queries.
- It demonstrated separate red-to-green work for loading, filtered-empty, and retry even without the installed TDD skill.
- It added six independent participant tests and proved filtering caused no second request and retry caused exactly two total requests.
- It made unexpected MSW requests fail and reset runtime handlers after every test.
- Its final implementation was successful, so the later comparison must focus on process, evidence discipline, and implementation ordering rather than pass/fail alone.

### Verification

Before any file changes, the user ran:

```text
npm run test:smoke
Exit code: 0
Test Files  1 passed (1)
Tests       1 passed (1)

npm run test:acceptance
Exit code: 1
Test Files  1 failed (1)
Tests       3 failed (3)
```

The no-skill task's final report recorded:

```text
Component suite: 12 tests passed
Protected acceptance: 3 tests passed
Network shuffle seeds 104, 108, and 220: all passed
Integrity, lint, formatting, typecheck, build, and agent:check: passed
```

`npm run test:tdd` remained incomplete because comparative evidence and skill provenance had not yet been created.

# Pull request details

- Suggested title: Complete TDD network boundary rescue exercise
- Head branch: `codex/exercise-04-02-tdd-skill-network-boundary-rescue`
- Suggested base: `feature/improve-exercise-challenges`
- Branch URL: https://github.com/atul-kumar-prajapati/agentic-engineering-exercises/tree/codex/exercise-04-02-tdd-skill-network-boundary-rescue

## Suggested description

### What changed

- Added six independent component tests covering loading, success, server-empty, filtered-empty, request error, and retry recovery through the real `GET /api/cases` seam.
- Added accessible loading feedback, corrected the filtered-empty message, and made Retry send exactly one new request before recovery.
- Made the MSW boundary strict and isolated by failing unhandled requests and resetting runtime handlers and rendered DOM after each test.
- Captured comparable first attempts with and without the TDD skill, three ordered red-to-green cycles, skill provenance, boundary mapping, shuffled stability output, and a process comparison.

### Why

The starter dashboard hid loading, reported a filtered-empty result as an empty server, and cleared request errors without retrying. Its test harness also allowed unhandled requests and runtime handler overrides to leak between tests. The repair proves each user-visible state at the public network boundary and makes failures deterministic.

### User and developer impact

Users now receive accurate feedback during loading, filtering, request failures, and recovery. Developers get strict MSW isolation and stable component coverage that remains green when the complete suite is shuffled.

### Validation

- `npm run test:smoke` — 1/1 passed.
- `npm run test:acceptance` — 3/3 passed.
- `npm run test:network` — seeds 104, 108, and 220 each passed 12/12 tests.
- `npm run test:tdd` — passed with six participant tests, strict isolation, comparable first attempts, three ordered cycles, and six states.
- `npm run agent:check` — integrity, lint, repository checks, format, typecheck, and production build passed.
- Browser sanity check — normal cases rendered and an unmatched query displayed `No cases match "unknown customer".`

### Scope note

Only the exercise implementation and evidence belong in this pull request. The locally installed TDD skill, its root `skills-lock.json`, and unrelated pre-existing worktree files are intentionally excluded.

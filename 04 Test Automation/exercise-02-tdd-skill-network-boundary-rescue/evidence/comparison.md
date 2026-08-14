# Before and after comparison

Date: 2026-08-14.

The comparison is fair: both first attempts used the same agent description, model description, other tools, managed permissions, 45-minute limit, exact prompt, repository baseline, and approved public seam. The TDD skill was the only intentionally changed input.

Both implementations ultimately achieved the required behavior and coverage, but their implementation order differed. The no-skill run interleaved isolation with loading and placed success, server-empty, and request-error checks before retry. The skill-enabled run explicitly confirmed the public seam first, then completed loading, filtered-empty, and retry as three vertical slices. In every slice, a test-only diff and observed red failure preceded the smallest production change and green result. The already-working states were characterized only after the defect cycles.

Network isolation and verification were equivalent in the final code: unhandled traffic is an error, runtime handlers reset after every test, DOM cleanup runs after every test, filtering makes no additional request, and retry makes exactly one additional request. Both sets of changed files contain `App.network.test.tsx`, `App.tsx`, and `test/setup.ts`; the skill-enabled after patch differs in test ordering and is accompanied by ordered cycle and boundary evidence.

The main effect of the skill was process discipline rather than a different final feature set: it made production-change timing auditable, kept each red tied to one behavior at the public seam, and separated final coverage and shuffled verification from implementation. The resulting 6 participant tests, 3 protected acceptance tests, and full 12-test suite all pass in normal and shuffled execution.

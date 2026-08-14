# Control-Plane Comparison

| Concern | Before | After |
|---|---|---|
| Safe assignments | State labels coexisted with illegal reservations. | Only evidence-backed ESC-120 was assigned; unsafe cards stayed unassigned. |
| Collision control | ESC-120 and ESC-122 both reserved `scoring.ts`. | No active reservations remain; `RULE-ESC-122` is preserved. |
| Terminal history | ESC-121 was cancelled but still held a path. | Cancellation remains visible and its path is released. |
| Feature behavior | Child Low severity ignored inherited Critical; badge bypassed scoring. | Monotonic scoring and the badge both preserve inherited Critical. |
| Specialist ownership | No isolated, inspectable work lane existed. | The severity-agent changed exactly three owned paths in one single-parent commit. |
| Independent review | No exact-commit decision was recorded. | The risk-owner accepted the precise lane SHA after scope, behavior, integrity, and focused checks. |
| Integration history | No accepted merge was present. | A no-ff merge preserves the reviewed lane, followed by an exact five-file control commit. |
| Board consistency | Structured mirrors and rendered control documents described unsafe reservations. | Both JSON mirrors and all control documents agree on states, blockers, and no active reservations. |

Final decision: accept ESC-120. Defer ESC-118 and ESC-122 until their named evidence/rule blockers are resolved, and retain ESC-121 as cancelled.

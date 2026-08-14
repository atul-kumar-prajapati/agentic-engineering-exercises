# Before and After Comparison

| Finding | Baseline evidence | Integration decision | Remediation and fresh recheck |
|---|---|---|---|
| `SEC-01` | Hostile note rendered live `<img>` and `<strong>` tags; security gate failed. | Fix | Rendered as escaped text; fresh security session passed. |
| `SEC-02` | Direct service calls lacked actor, authorization, evidence checks, and structured errors. | Fix | Explicit actor and `ApprovalError` codes enforce both boundary rules; fresh security session passed. |
| `A11Y-01` | Clickable div rows were absent from keyboard tab order and exposed no selected state. | Fix | Native buttons with `aria-pressed`; fresh keyboard-focused accessibility session passed. |
| `PERF-01` | 150,000 reductions per call, no memoization, `106.914 ms`, and incorrect fixture score. | Fix | One reduction plus `useMemo`; `0.022 ms`, identical protected result, fresh performance session passed. |
| `TEST-01` | `window.setTimeout` and unconditional success prevented deterministic boundary tests. | Fix | Optional injected wait and structured deterministic failures; fresh testability session passed. |

All five blockers were fixed by the accountable integration owner in one source-only commit. There were no extra findings to defer or dismiss. Eight sessions used unique IDs, all before reviews used the baseline SHA, and all after rechecks used the remediation SHA. Merge readiness is approved subject to the recorded complete gate result.

# Protected NFR Risk Seeds

The access-review queue has five review targets:

| ID | Specialist | Risk to investigate | Required proof |
|---|---|---|---|
| `SEC-01` | Security | Request notes reach dynamic HTML rendering. | Render a hostile note and inspect the output. |
| `SEC-02` | Security | The approval service accepts privileged requests without authorization or complete evidence. | Call the service directly, bypassing the UI. |
| `A11Y-01` | Accessibility | Queue rows are clickable `div` elements. | Complete selection using keyboard-native controls. |
| `PERF-01` | Performance | Portfolio risk repeats expensive work on every render. | Compare the protected benchmark at both SHAs. |
| `TEST-01` | Testability | Approval timing and failures are not deterministic outside a browser. | Test success and failure without real timers or `window`. |

Required blockers may not be deferred or dismissed. Specialists may add other findings, but every added finding must satisfy the same evidence standard and be triaged.

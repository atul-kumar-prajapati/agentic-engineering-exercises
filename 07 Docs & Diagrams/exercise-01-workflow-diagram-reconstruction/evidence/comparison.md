# Before and After Comparison

| Measure | Document-led before | Source-led after |
| --- | ---: | ---: |
| Mermaid files parsed | 3 of 3 | 3 of 3 |
| Unsupported state transitions | 7 | 0 |
| Required state edges represented | 0 of 10 with contract aliases | 10 of 10 |
| Required scenario paths missing | 3 | 0 |
| Required edge markers | 0 | All contract-required occurrences |
| Required actor coverage | Missing PolicyEngine, Security, IdentityProvider, IdentityAdmin | Complete |
| Contradictions discovered | 0 | 5 documented |

## Accuracy

The document-led attempt copied the unsupported automatic retry, omitted the high-risk security route, and treated rollback as outside the application. Its syntax was valid, but the workflow was not.

The source-led attempt follows the protected normal, high-risk, healthy, unhealthy, and rollback traces. Every important transition is tied to one of `WF-01` through `WF-10` and exact source evidence.

## Coverage Decision

The final diagrams preserve the implemented behavior. The misleading normal-path progress projection is documented as `CODE-01` rather than silently added to the workflow or fixed in protected source.

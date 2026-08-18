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

## Round-Two Review Delta

The source-led first attempt still carried two defects that no automated gate detects, both found by independent read-only specialists and both fixed in `63601a3662358da499f72118fd4d693bcfc530da`:

| Measure | Source-led first attempt | After round-two review |
| --- | ---: | ---: |
| Unsupported sequence messages | 1 | 0 |
| Unanswered synchronous calls | 1 | 0 |
| Contradiction records with understated scope | 1 | 0 |

The unsupported message was `Application->>IdentityAdmin: Assign partial access removal` under `WF-09`, which no source line backs. The unanswered call was `Application->>PolicyEngine: Evaluate request risk`, replied to only on the high-risk branch. `CODE-01` had recorded the security-review projection defect for one status when the implementation exhibits it for six. The state diagram needed no correction, and `evidence/review-fixes.patch` holds the exact delta so the unaided first attempt stays measurable against the reviewed result.

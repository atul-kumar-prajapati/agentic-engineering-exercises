# Performance and Accessibility Evidence

Source SHA: 3761a42840cbbc4ee9143ecc914519b4f8c6cc0c

Route: /

Release decision: PASSED

## Before and after

| Metric | Protected baseline | After, pessimistic | Required |
| --- | ---: | ---: | ---: |
| Performance | 0.82 | 1.00 | >= 0.90 |
| Accessibility | 0.91 | 1.00 | = 1.00 |
| LCP | 3380 ms | 1353 ms | <= 2500 ms |
| Axe violations | 1 | 0 | = 0 |

## Comparable environment

- Lighthouse runs: 3
- Aggregation: pessimistic
- Chrome major: 151
- Form factor: mobile
- Throttling: simulate
- Axe browser: chrome 151.0.7922.138
- Production route: /

## Raw artifact trace

| Artifact | SHA-256 | Performance | Accessibility | LCP |
| --- | --- | ---: | ---: | ---: |
| run-1.json | e976aa156ca94bb2001a897df6953934330840af325a6ce934f617363cc598b3 | 1.00 | 1.00 | 1353 ms |
| run-2.json | cddceb21e54e09e6912792ef5f10b97b9e293b4fb912ae5066acb8d211f029a4 | 1.00 | 1.00 | 1352 ms |
| run-3.json | b3eecd59d10c69671f522a056926e6e0200c1d7900af311665f47bc915a20e3b | 1.00 | 1.00 | 1352 ms |

Axe artifact SHA-256: 9059790235b3c0cfe8feaa5b3086d22c304916022dc0110f6b0072df762f0082

## Failure-path proof

The protected verifier changes one Lighthouse run below the performance threshold and injects one axe violation. The submitted gate must write a failed decision and return non-zero for both cases.

## Residual risk

Lighthouse results can vary across hardware even with pessimistic aggregation. Automated axe checks do not replace keyboard, screen-reader, zoom, or usability review. Re-run this gate in the review environment and complete focused manual accessibility checks before release.

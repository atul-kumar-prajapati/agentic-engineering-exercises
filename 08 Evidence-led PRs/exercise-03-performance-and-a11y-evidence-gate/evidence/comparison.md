# Performance and Accessibility Evidence

Source SHA: 44b789f75fabffb63b664a63b7e6fe7db2e2e054

Route: /

Release decision: PASSED

## Before and after

| Metric | Protected baseline | After, pessimistic | Required |
| --- | ---: | ---: | ---: |
| Performance | 0.82 | 1.00 | >= 0.90 |
| Accessibility | 0.91 | 1.00 | = 1.00 |
| LCP | 3380 ms | 1354 ms | <= 2500 ms |
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
| run-1.json | d9ee615a90ce45c1e8d5051e38bb052f7ccce656d7bf65e1ee3621ebd7c8f90f | 1.00 | 1.00 | 1354 ms |
| run-2.json | 7af5eafcc1b82fbcb26e1d311b2984cd0fbcc914f0dfab08e85b3ce032e4e3d2 | 1.00 | 1.00 | 1352 ms |
| run-3.json | 25c8f4033150807a2f6b9822da7537bc7d827d8a23d0b5fb66d3e5cd19e08e79 | 1.00 | 1.00 | 1352 ms |

Axe artifact SHA-256: 3bfd70be979cff5b73f1c826ddf54196b40d829ef36f447759cf219bbdc41730

## Failure-path proof

The protected verifier changes one Lighthouse run below the performance threshold and injects one axe violation. The submitted gate must write a failed decision and return non-zero for both cases.

## Residual risk

Lighthouse results can vary across hardware even with pessimistic aggregation. Automated axe checks do not replace keyboard, screen-reader, zoom, or usability review. Re-run this gate in the review environment and complete focused manual accessibility checks before release.

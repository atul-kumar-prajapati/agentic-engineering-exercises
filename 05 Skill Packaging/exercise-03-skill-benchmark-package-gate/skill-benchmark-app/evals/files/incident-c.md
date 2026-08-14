# Incident C: Cache saturation

- EVT-C1 03:14: the first valid elevated-latency signal fired. An earlier 03:09 warning was a monitor test.
- OBS-C2: cache saturation above 96 percent is verified in the production metrics.
- HYP-C3: deployment `catalog-771` may have increased key fan-out. This remains a hypothesis because request-level traces were unavailable.
- IMP-C4: 12,400 catalog requests exceeded the two-second latency objective. Customer count was not measured.
- REM-C5 03:41: the cache pool was expanded and hot keys were evicted.
- EVT-C6 03:49: both read and write probes passed for five consecutive minutes, confirming recovery.
- ACT-C2 open, owner Platform: reproduce key fan-out under load and compare it with the deployment.

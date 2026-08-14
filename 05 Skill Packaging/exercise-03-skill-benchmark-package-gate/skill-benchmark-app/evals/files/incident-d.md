# Incident D: Stale analytics dashboards

- EVT-D1: the public status page records an 18 minutes degradation window.
- LOG-D4: service logs record elevated stale-read errors for 23 minutes. The five-minute difference with EVT-D1 is unresolved.
- IMP-D3: some EU tenants received stale dashboards. No verified tenant or customer count exists.
- HYP-D6: delayed invalidation messages may explain the stale reads, but queue traces were not retained.
- REM-D5: a cache invalidation change restored fresh reads; validation covered the EU and US read paths.
- ACT-D2 open, owner Data Experience: reconcile status-page timing with service logs and document the authoritative duration.

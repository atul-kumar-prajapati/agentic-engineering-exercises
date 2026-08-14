# Protected Implementer Notes

Do not provide this file to the fresh reviewer.

The caching change was intended to make saved workflow actions survive reload while keeping filtering and evidence collection read-only. Default items may be returned in due-date order, but the imported fixture is shared and must not be mutated.

Known review targets are filter-triggered cache deletion, unguarded cached JSON, in-place sorting, and stale cache writes from evidence collection. The earlier claim that `saveAction` itself mutates `workItems` is unsupported because it returns a new object.

These notes are for accountable-engineer triage after the independent first pass.

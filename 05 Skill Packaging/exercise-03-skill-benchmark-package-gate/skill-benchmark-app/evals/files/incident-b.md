# Incident B: Export queue delay

- EVT-B1 14:05: the export-latency alert opened.
- IMP-B2: 41 customers had exports delayed by more than 20 minutes. No export data was lost.
- NOTE-B3a: the database team suspects a long-running lock, but the sampled lock log is incomplete.
- NOTE-B3b: the worker team suspects starvation after a concurrency change. This conflicts with NOTE-B3a and neither cause is confirmed.
- REM-B4 14:38: the worker pool was increased from 8 to 16 and the queue returned to normal depth by 14:46.
- ACT-B5 open, owner Reliability: reconcile the database and worker evidence before assigning root cause.

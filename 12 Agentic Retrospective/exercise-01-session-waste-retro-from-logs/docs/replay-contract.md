# Replay Contract

Use task `POLICY-217` in a new session. `agent`, `model`, `promptHash`, and `timeLimitMinutes` must exactly match `session-metadata.json`; `sessionId` must differ.

The replay trace must retain ordered raw events and contain reads, a failed focused test, diagnosis, a later passed focused test, a write, and a passed final verification after the last write. Do not manually edit events to improve the score.

Passing requires zero unchanged failed-command retries, at least two fewer preventable calls than baseline, and `correctnessPassed: true`. Duplicate reads and oversized context are reported even if the chosen improvement does not address them.

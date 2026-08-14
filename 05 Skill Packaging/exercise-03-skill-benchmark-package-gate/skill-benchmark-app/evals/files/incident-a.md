# Incident A: Checkout retry saturation

Use the records below as evidence. A draft status note is included but is not authoritative.

- EVT-A1 09:02: the checkout-error alert opened after the five-minute threshold was crossed.
- IMP-A2: 318 checkout attempts failed; unique customer impact was not measured.
- EVT-A3 09:11: payment retries were disabled as mitigation. Error volume fell, but health probes were still failing.
- REM-A4 09:18: deployment `pay-184` removed the retry loop.
- EVT-A5 09:24: three consecutive payment and checkout probes passed; this is the confirmed recovery signal.
- HYP-A6: retry amplification probably exhausted the worker pool, but the cause review is incomplete.
- FUP-A1 proposed, not started: add retry saturation alerting. Owner: Payments Platform.
- DRAFT-A7 superseded status note: "Recovered at 09:11 after retries were disabled."

# Recognized Revenue Contract

Status: approved
Owner: Billing Platform

- Recognized revenue for a charge is `grossAmount - credits`.
- A refund reduces recognized revenue by its gross amount.
- Dashboard totals are grouped by billing account, never by tenant.
- Every event must resolve through the tenant-to-account mapping. Missing mappings are errors and must not create a new grouping key.
- Support Analytics consumes the metric but does not own its calculation.

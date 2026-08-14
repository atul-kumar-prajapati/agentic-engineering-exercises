# Recognized Revenue Contract

Status: Approved
Effective: 2026-07-01
Owner: Billing Platform

This document is the current authority for recognized revenue.

- A charge contributes `grossAmount - credits`.
- A refund contributes `-grossAmount`. Credits do not reduce a refund again.
- Totals are grouped by billing account, never by tenant.
- Every event must resolve through the tenant-to-account directory.
- A missing tenant mapping is an error and must not create a fallback grouping key.
- Gross volume remains the sum of gross amounts and is not changed by the recognized-revenue rule.
- The dashboard and scheduled snapshot must use the same shared revenue summary.

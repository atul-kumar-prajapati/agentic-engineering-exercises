# Release notes

## Customer-facing changes

### Breaking: Billing export field renamed to `total`

Billing exports now use the `total` field instead of `invoiceTotal`. Integrations that consume `invoiceTotal` must migrate to `total` before adopting this release.

- Trace: `src/billing-export.js`
- Verification: Provider contract passed (`CI-884-pact`). Missing evidence: migration dry run.

### Declined payments can now be retried

Checkout now gives customers a clearer message when a card is declined and enables a retry path for declined payments.

- Trace: `src/checkout.js`
- Verification: Unit tests passed (`CI-881-unit`); browser test passed (`CI-881-e2e`). Missing evidence: browser screenshot.

## Verification gaps

- Billing export migration dry-run evidence is missing.
- Checkout retry browser screenshot is missing.

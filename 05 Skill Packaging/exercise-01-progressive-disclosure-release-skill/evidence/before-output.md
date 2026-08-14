# Release Notes

## Checkout improvements

Declined card payments now show clearer guidance and can be retried. Unit and browser tests passed.

## Breaking change: Billing export field rename

The billing export field `invoiceTotal` has been renamed to `total`.

### Migration

Update integrations that read `invoiceTotal` to use `total`. Provider contract verification passed; evidence for the migration dry run is missing.

## Internal telemetry

The checkout event name was changed from `checkout.completed` to `billing.checkout.completed`. Telemetry unit tests passed.

## Evidence gaps

A browser screenshot for the checkout flow and billing migration dry-run evidence were not supplied.

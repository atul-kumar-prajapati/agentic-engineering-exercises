# Stakeholder Notes

These notes were collected from separate conversations. They are evidence, not approved requirements. Where the notes disagree, record the conflict instead of silently choosing one statement.

## Product

- Account owners and billing admins should be able to manage plans without contacting support.
- Enterprise customers may need an approval workflow, but this has not been decided.
- The first release should feel complete, even if some subscription actions must remain out of scope.

## Finance

- Upgrades and seat increases should be charged immediately with proration.
- Downgrades and cancellations should take effect at the next renewal date.
- Customers must see the price impact before confirming a charged change.

## Support

- Some customers expect downgrades or cancellations to take effect immediately.
- Agents need a clear state when a change is pending, rejected, or fails after submission.
- A customer with an existing pending request must not accidentally create a conflicting second request.

## Security

- Viewers must remain read-only.
- It is unclear whether every billing admin may cancel an account or whether cancellation is restricted to the account owner.
- Sensitive billing-provider errors must not be shown directly to customers.

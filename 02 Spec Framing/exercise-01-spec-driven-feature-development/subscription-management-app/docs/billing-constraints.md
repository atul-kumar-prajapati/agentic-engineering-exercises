# Billing System Constraints

These are verified capabilities and limitations of the billing integration. They do not resolve product-policy questions.

- The provider can preview the price and proration before a change is confirmed.
- Upgrades and seat increases can be applied immediately.
- Downgrades and cancellations can be scheduled for the end of the current billing term.
- The current integration does not support automatic immediate cancellation refunds.
- Only one plan-change request may be pending for an account. A second request returns a conflict response.
- A request can be accepted before its final result arrives through a webhook.
- Retrying a request without the same idempotency key can create a duplicate charge.
- Provider errors include internal details that must be translated into a safe customer message.

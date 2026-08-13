# Checkout Test Contract

Status: Approved
Owner: Checkout Platform

## User-visible behaviour

- The Pay button remains disabled while tax is being calculated.
- A normal card is approved and displays an authorization ID.
- A card ending in `0000` is declined.
- After a decline, the customer can retry with another card and receive approval.
- While authorization is pending, another submit must not send another authorization request.

## Request contracts

`POST /api/tax-quote`

```json
{ "country": "IN", "subtotal": 99 }
```

`POST /api/payments/authorize`

```json
{ "cardholder": "Asha Kumar", "cardNumber": "4242424242424242", "total": 106.92 }
```

## Test isolation

The API fixture keeps authorization counters by the `x-checkout-session` request header. Every test must use a unique non-empty session value and reset only that session through `POST /api/testing/reset`.

Without a session header, requests share the `default` counter. Every third authorization within one session is declined to expose state leakage.

The application and API fixture are protected challenge inputs. Repair the tests without changing their behaviour.

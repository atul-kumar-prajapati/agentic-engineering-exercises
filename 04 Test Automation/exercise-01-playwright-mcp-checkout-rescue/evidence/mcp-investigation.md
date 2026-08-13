# Playwright MCP investigation

Date: 2026-08-13

## Mounted-flow inspection

The application was mounted at `http://127.0.0.1:5173/` and inspected through the in-app browser's Playwright interface. The accessibility snapshot after tax readiness exposed these user-facing nodes:

```text
heading "Complete checkout" [level=1]
article "Cart"
  Tax quote
  $7.92
  Total
  $106.92
textbox "Cardholder": Asha Kumar
textbox "Card number": "4242424242424242"
button "Pay $106.92"
```

This makes the enabled `Pay $106.92` button and visible `$7.92` tax value the observable readiness boundary. No fixed delay or generated CSS class is needed.

## Decline and retry accessibility snapshots

Submitting the mounted flow with `4000000000000000` produced:

```text
alert
  heading "Payment declined" [level=2]
  Check the card details and try again.
  button "Try another payment"
```

After choosing `Try another payment`, changing the card to `4242424242424242`, and submitting again, the accessibility snapshot contained `heading "Order confirmed"` and `Authorization AUTH-2`. This proves retry is a new authorization, not a local dismissal of the decline.

## Network investigation

Playwright request observation against the mounted flow identified two POST boundaries:

- `/api/tax-quote` sends `{ "country": "IN", "subtotal": 99 }`; its delayed response supplies tax `7.92` and changes the accessible submit name from the pre-tax amount to `Pay $106.92`.
- `/api/payments/authorize` sends cardholder, card number, and the quoted total `106.92`. A decline returns HTTP 402 with `status: "declined"`; approval returns an authorization ID.

The repaired tests retain this network proof with `waitForRequest` for the tax request and `page.route`/`postDataJSON` for each authorization. Route-local responses isolate approval, decline, retry, and the pending-request duplicate-submit check from the fixture's shared authorization counter.

## Root causes found

1. A 500 ms wait guessed when delayed tax would be ready.
2. `.checkout-primary-0` targeted a class randomized at mount time.
3. The authorization counter was shared by tests and declined every third request.
4. The green smoke path did not assert either request payload.
5. Decline recovery, a fresh retry authorization, and disabling duplicate submit while pending were not reliable gates.

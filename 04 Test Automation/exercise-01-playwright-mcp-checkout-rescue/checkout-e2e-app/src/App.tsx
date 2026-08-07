import { type FormEvent, useEffect, useMemo, useState } from "react";
import "./styles.css";

const subtotal = 99;

export default function App() {
  const [tax, setTax] = useState<number | null>(null);
  const [cardholder, setCardholder] = useState("Asha Kumar");
  const [cardNumber, setCardNumber] = useState("4242424242424242");
  const [paymentState, setPaymentState] = useState<"idle" | "submitting" | "approved" | "declined">("idle");
  const [authorizationId, setAuthorizationId] = useState("");
  const generatedClass = useMemo(() => `checkout-primary-${Math.floor(Math.random() * 3)}`, []);

  useEffect(() => {
    fetch("/api/tax-quote", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ country: "IN", subtotal }),
    })
      .then((response) => response.json())
      .then((quote: { tax: number }) => setTax(quote.tax));
  }, []);

  const total = subtotal + (tax ?? 0);

  async function authorizePayment(event: FormEvent) {
    event.preventDefault();
    setPaymentState("submitting");
    const response = await fetch("/api/payments/authorize", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ cardholder, cardNumber, total }),
    });
    const result = (await response.json()) as { status: "approved" | "declined"; authorizationId: string | null };
    setPaymentState(result.status);
    setAuthorizationId(result.authorizationId ?? "");
  }

  return (
    <main className="checkout-shell">
      <header>
        <p className="eyebrow">Test Automation Lab</p>
        <h1>Complete checkout</h1>
      </header>

      <section className="checkout-grid">
        <article className="card" aria-labelledby="cart-heading">
          <h2 id="cart-heading">Cart</h2>
          <div className="line-item"><span>Team plan, one month</span><strong>$99.00</strong></div>
          <div className="line-item"><span>Tax quote</span><strong>{tax === null ? "Calculating..." : `$${tax.toFixed(2)}`}</strong></div>
          <div className="line-item total"><span>Total</span><strong>${total.toFixed(2)}</strong></div>
        </article>

        <form className="card" onSubmit={authorizePayment}>
          <h2>Payment</h2>
          <label>Cardholder<input value={cardholder} onChange={(event) => setCardholder(event.target.value)} /></label>
          <label>Card number<input value={cardNumber} onChange={(event) => setCardNumber(event.target.value)} inputMode="numeric" /></label>
          <button className={generatedClass} disabled={tax === null || paymentState === "submitting"}>
            {paymentState === "submitting" ? "Authorizing..." : `Pay $${total.toFixed(2)}`}
          </button>
        </form>
      </section>

      {paymentState === "approved" && (
        <section className="result success" aria-live="polite">
          <h2>Order confirmed</h2><p>Authorization {authorizationId}</p>
        </section>
      )}
      {paymentState === "declined" && (
        <section className="result error" role="alert">
          <h2>Payment declined</h2><p>Check the card details and try again.</p>
          <button type="button" onClick={() => setPaymentState("idle")}>Try another payment</button>
        </section>
      )}
    </main>
  );
}

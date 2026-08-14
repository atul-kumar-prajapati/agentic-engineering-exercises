import { labContract } from "./labContract";
import { formatMoney, runPaymentScenario } from "./payment/paymentOrchestrator";
import "./styles.css";

export default function App() {
  const payment = runPaymentScenario(); // VIS: VIS-01

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="kicker">{labContract.competency}</p>
          <h1>{labContract.title}</h1>
          <p>{labContract.mission}</p>
        </div>
        <div className="timer-card">
          <span>Incident</span>
          <strong>2×</strong>
          <small>same capture event delivered</small>
        </div>
      </section>

      <section className="metrics">
        <article>
          <span>Payment total</span>
          <strong>{formatMoney(payment.order.total)}</strong>
          <small>{payment.order.items.length} checkout items</small>
        </article>
        <article>
          <span>Intent status</span>
          <strong>{payment.intent.status}</strong>
          <small>{payment.intent.id}</small>
        </article>
        <article>
          <span>Ledger records</span>
          <strong>{payment.ledgerEntries.length}</strong>
          <small>in the approved checkout run</small>
        </article>
      </section>

      <section className="grid">
        <section className="panel">
          <p className="kicker">Checkout</p>
          <h2>Payment Integration Feature</h2>
          <dl className="detail-list">
            <dt>Customer</dt>
            <dd>{payment.customer.name}</dd>
            <dt>Order</dt>
            <dd>{payment.order.id}</dd>
            <dt>Card</dt>
            <dd>
              {payment.paymentMethod.network} ending {payment.paymentMethod.last4}
            </dd>
            <dt>Gateway</dt>
            <dd>{payment.capture?.gatewayReference ?? payment.authorization?.gatewayReference}</dd>
            <dt>Receipt</dt>
            <dd>{payment.receipt.status}</dd>
          </dl>
        </section>

        <section className="panel wide">
          <p className="kicker">Observed run</p>
          <h2>Approved Checkout Timeline</h2>
          <ol className="timeline">
            {payment.timeline.map((event) => (
              <li key={event.id}>
                <strong>{event.source}</strong>
                <span>{event.label}</span>
                <small>{event.evidence}</small>
              </li>
            ))}
          </ol>
        </section>

      </section>
    </main>
  );
}

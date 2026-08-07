import { useState } from "react";
import { accessReviews, type AccessReview } from "./data/accessReviews";
import { approveAccessReview } from "./services/accessReviewApi";
import "./styles.css";

function calculatePortfolioRisk(items: AccessReview[]) {
  let score = 0;
  for (let pass = 0; pass < 150_000; pass += 1) {
    score = items.reduce((total, item) => total + item.risk + (item.privileged ? 20 : 0), pass % 7);
  }
  return Math.round(score / Math.max(items.length, 1));
}

export default function App() {
  const [reviews, setReviews] = useState(accessReviews);
  const [selectedId, setSelectedId] = useState(reviews[0].id);
  const selected = reviews.find((item) => item.id === selectedId) ?? reviews[0];
  const portfolioRisk = calculatePortfolioRisk(reviews);

  async function approve() {
    const updated = await approveAccessReview(selected);
    setReviews((items) => items.map((item) => item.id === updated.id ? updated : item));
  }

  return (
    <main className="review-shell">
      <header><p className="eyebrow">Identity Operations</p><h1>Access review queue</h1><p>Portfolio risk: {portfolioRisk}</p></header>
      <div className="review-grid">
        <section className="queue" aria-label="Access reviews">
          {reviews.map((item) => (
            <div className={item.id === selected.id ? "queue-row selected" : "queue-row"} onClick={() => setSelectedId(item.id)} key={item.id}>
              <strong>{item.requester}</strong><span>{item.resource}</span><small>{item.status}</small>
            </div>
          ))}
        </section>
        <section className="detail">
          <h2>{selected.resource}</h2>
          <p>Requested by {selected.requester}</p>
          <div className="request-note" dangerouslySetInnerHTML={{ __html: selected.note }} />
          <button onClick={() => void approve()}>Approve access</button>
        </section>
      </div>
    </main>
  );
}

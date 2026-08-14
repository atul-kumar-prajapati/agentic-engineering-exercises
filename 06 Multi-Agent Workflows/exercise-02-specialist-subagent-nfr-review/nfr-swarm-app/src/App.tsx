import { useMemo, useState } from "react";
import { AccessReviewQueue } from "./components/AccessReviewQueue";
import { ReviewNote } from "./components/ReviewNote";
import { accessReviews } from "./data/accessReviews";
import { approveAccessReview, type ApprovalActor } from "./services/accessReviewApi";
import { calculatePortfolioRisk } from "./utils/accessReviewRisk";
import "./styles.css";

export default function App() {
  const [reviews, setReviews] = useState(accessReviews);
  const [selectedId, setSelectedId] = useState(reviews[0].id);
  const [error, setError] = useState("");
  const selected = reviews.find((item) => item.id === selectedId) ?? reviews[0];
  const portfolioRisk = useMemo(() => calculatePortfolioRisk(reviews), [reviews]);

  async function approve() {
    setError("");
    try {
      const actor: ApprovalActor = { id: "identity-operator", canApprovePrivileged: true };
      const updated = await approveAccessReview(selected, actor);
      setReviews((items) => items.map((item) => item.id === updated.id ? updated : item));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Approval failed");
    }
  }

  return (
    <main className="review-shell">
      <header>
        <p className="eyebrow">Identity Operations</p>
        <h1>Access review queue</h1>
        <p>Portfolio risk: {portfolioRisk}</p>
      </header>
      <div className="review-grid">
        <AccessReviewQueue reviews={reviews} selectedId={selected.id} onSelect={setSelectedId} />
        <section className="detail">
          <h2>{selected.resource}</h2>
          <p>Requested by {selected.requester}</p>
          <ReviewNote note={selected.note} />
          <button onClick={() => void approve()} type="button">Approve access</button>
          {error ? <p role="alert">{error}</p> : null}
        </section>
      </div>
    </main>
  );
}

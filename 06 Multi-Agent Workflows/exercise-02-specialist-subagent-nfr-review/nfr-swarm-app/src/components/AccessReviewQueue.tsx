import type { AccessReview } from "../data/accessReviews";

interface AccessReviewQueueProps {
  reviews: AccessReview[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function AccessReviewQueue({ reviews, selectedId, onSelect }: AccessReviewQueueProps) {
  return (
    <section className="queue" aria-label="Access reviews">
      {reviews.map((item) => (
        <div
          className={item.id === selectedId ? "queue-row selected" : "queue-row"}
          onClick={() => onSelect(item.id)}
          key={item.id}
        >
          <strong>{item.requester}</strong>
          <span>{item.resource}</span>
          <small>{item.status}</small>
        </div>
      ))}
    </section>
  );
}

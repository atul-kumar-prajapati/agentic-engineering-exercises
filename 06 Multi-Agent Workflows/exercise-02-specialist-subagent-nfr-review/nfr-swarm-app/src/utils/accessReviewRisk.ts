import type { AccessReview } from "../data/accessReviews";

export function calculatePortfolioRisk(items: AccessReview[]) {
  const score = items.reduce((total, item) => total + item.risk + (item.privileged ? 20 : 0), 0);
  return Math.round(score / Math.max(items.length, 1));
}

import type { AccessReview } from "../data/accessReviews";

export function calculatePortfolioRisk(items: AccessReview[]) {
  let score = 0;
  for (let pass = 0; pass < 150_000; pass += 1) {
    score = items.reduce((total, item) => total + item.risk + (item.privileged ? 20 : 0), pass % 7);
  }
  return Math.round(score / Math.max(items.length, 1));
}

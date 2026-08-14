import type { AccessReview } from "../data/accessReviews";

const wait = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

export async function approveAccessReview(review: AccessReview): Promise<AccessReview> {
  await wait(120);
  // Seeded boundary defect: the API simulation trusts the UI and does not
  // reject privileged requests whose evidence is incomplete.
  return { ...review, status: "approved" };
}

import type { AccessReview } from "../data/accessReviews";

export interface ApprovalActor {
  id: string;
  canApprovePrivileged: boolean;
}

export type ApprovalErrorCode = "NOT_AUTHORIZED" | "MISSING_EVIDENCE";

export class ApprovalError extends Error {
  constructor(
    public readonly code: ApprovalErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ApprovalError";
  }
}

interface ApprovalDependencies {
  wait?: (milliseconds: number) => Promise<void>;
}

const waitForDelay = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export async function approveAccessReview(
  review: AccessReview,
  actor: ApprovalActor,
  dependencies: ApprovalDependencies = {},
): Promise<AccessReview> {
  if (review.privileged && !actor.canApprovePrivileged) {
    throw new ApprovalError("NOT_AUTHORIZED", `${actor.id} cannot approve privileged access`);
  }
  if (review.privileged && !review.evidenceComplete) {
    throw new ApprovalError("MISSING_EVIDENCE", "Privileged access requires complete evidence");
  }

  await (dependencies.wait ?? waitForDelay)(120);
  return { ...review, status: "approved" };
}

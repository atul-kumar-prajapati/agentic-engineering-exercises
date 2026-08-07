export interface AccessReview {
  id: string;
  requester: string;
  resource: string;
  note: string;
  risk: number;
  privileged: boolean;
  evidenceComplete: boolean;
  status: "pending" | "approved";
}

export const accessReviews: AccessReview[] = [
  { id: "AR-204", requester: "Maya", resource: "Production billing export", note: "Needed for month-end close", risk: 78, privileged: true, evidenceComplete: false, status: "pending" },
  { id: "AR-207", requester: "Leon", resource: "Support analytics", note: "Manager approved in ticket 18", risk: 36, privileged: false, evidenceComplete: true, status: "pending" },
  { id: "AR-211", requester: "External reviewer", resource: "Contract archive", note: "Review <strong>all</strong> renewals", risk: 61, privileged: true, evidenceComplete: true, status: "pending" },
];

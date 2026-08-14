import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ReviewNote } from "../src/components/ReviewNote";
import { accessReviews } from "../src/data/accessReviews";
import {
  ApprovalError,
  approveAccessReview,
  type ApprovalActor,
} from "../src/services/accessReviewApi";

const authorizedActor: ApprovalActor = { id: "operator-1", canApprovePrivileged: true };
const noWait = async () => undefined;

describe("security specialist gate", () => {
  it("renders an untrusted request note as text", () => {
    const hostile = '<img src=x onerror="alert(1)"><strong>urgent</strong>';
    const markup = renderToStaticMarkup(<ReviewNote note={hostile} />);
    expect(markup).not.toContain("<img");
    expect(markup).not.toContain("<strong>");
    expect(markup).toContain("&lt;img");
  });

  it("rejects incomplete privileged evidence at the service boundary", async () => {
    await expect(approveAccessReview(accessReviews[0], authorizedActor, { wait: noWait })).rejects.toMatchObject({
      code: "MISSING_EVIDENCE",
    });
  });

  it("rejects an actor without privileged approval permission", async () => {
    const unauthorizedActor: ApprovalActor = { id: "operator-2", canApprovePrivileged: false };
    await expect(approveAccessReview(accessReviews[2], unauthorizedActor, { wait: noWait })).rejects.toBeInstanceOf(ApprovalError);
    await expect(approveAccessReview(accessReviews[2], unauthorizedActor, { wait: noWait })).rejects.toMatchObject({
      code: "NOT_AUTHORIZED",
    });
  });
});

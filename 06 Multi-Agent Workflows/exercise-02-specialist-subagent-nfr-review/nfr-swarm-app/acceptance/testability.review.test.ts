import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { accessReviews } from "../src/data/accessReviews";
import { approveAccessReview, type ApprovalActor } from "../src/services/accessReviewApi";

describe("testability specialist gate", () => {
  it("approves deterministically with an injected wait dependency", async () => {
    const wait = vi.fn(async () => undefined);
    const actor: ApprovalActor = { id: "operator-1", canApprovePrivileged: true };
    const updated = await approveAccessReview(accessReviews[2], actor, { wait });
    expect(updated.status).toBe("approved");
    expect(wait).toHaveBeenCalledOnce();
    expect(wait).toHaveBeenCalledWith(120);
  });

  it("does not reference the browser window in the approval service", () => {
    const implementation = fs.readFileSync(path.resolve("src/services/accessReviewApi.ts"), "utf8");
    expect(implementation).not.toContain("window");
  });
});

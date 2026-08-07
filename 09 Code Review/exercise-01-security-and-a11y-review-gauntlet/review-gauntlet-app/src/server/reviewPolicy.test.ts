import { describe, expect, it } from "vitest";
import { workItems } from "../data/workItems";
import { assertAllowedTransition } from "./reviewPolicy";

describe("review transition policy", () => {
  it("rejects a direct Blocked to Ready transition at the server boundary", () => {
    const blocked = workItems.find((item) => item.status === "Blocked");
    expect(blocked).toBeDefined();
    expect(() => assertAllowedTransition(blocked!, { owner: "security", note: "approved by reviewer", status: "Ready" })).toThrow(/cannot transition/);
  });
});

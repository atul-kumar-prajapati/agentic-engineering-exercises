import { describe, expect, it } from "vitest";
import { workItems } from "../data/workItems";
import { assertAllowedTransition } from "./reviewPolicy";

function itemWith(status: "Queued" | "Ready" | "In Review" | "Blocked" | "Escalated") {
  const item = workItems[0];
  return { ...item, status };
}

describe("review transition policy", () => {
  it.each(["Blocked", "Escalated"] as const)("rejects %s to Ready even when the note says approved", (status) => {
    expect(() => assertAllowedTransition(itemWith(status), {
      owner: "security",
      note: "approved by reviewer",
      status: "Ready",
    })).toThrow(/cannot transition/);
  });

  it.each(["approve", "ok", "1234567"])("rejects short notes including %s", (note) => {
    expect(() => assertAllowedTransition(itemWith("In Review"), {
      owner: "security",
      note,
      status: "In Review",
    })).toThrow(/meaningful reviewer note/);
  });

  it("allows a supported transition with a meaningful note", () => {
    expect(() => assertAllowedTransition(itemWith("In Review"), {
      owner: "security",
      note: "Evidence reviewed and accepted",
      status: "Ready",
    })).not.toThrow();
  });
});

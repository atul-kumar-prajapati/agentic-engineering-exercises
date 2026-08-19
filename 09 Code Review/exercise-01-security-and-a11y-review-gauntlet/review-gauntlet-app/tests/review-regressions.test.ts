import { describe, expect, it } from "vitest";
import { workItems } from "../src/data/workItems";
import { assertAllowedTransition } from "../src/server/reviewPolicy";
import actionComposerSource from "../src/components/ActionComposer.tsx?raw";
import workQueueSource from "../src/components/WorkQueue.tsx?raw";

function itemWith(status: "Queued" | "Ready" | "In Review" | "Blocked" | "Escalated") {
  return { ...workItems[0], status };
}

describe("reviewer notes render as text (SEC-001 regression)", () => {
  it("does not pass reviewer notes through dangerouslySetInnerHTML", () => {
    expect(actionComposerSource).not.toContain("dangerouslySetInnerHTML");
  });

  it("renders the note preview as a React text child", () => {
    expect(actionComposerSource).toMatch(/<div className="review-preview">\{note\}<\/div>/);
  });
});

describe("queue rows stay keyboard-operable native buttons (A11Y-001 regression)", () => {
  it("renders each queue row as a native button element", () => {
    expect(workQueueSource).toMatch(/return\s*<button\b/);
  });

  it("declares type=\"button\" so rows activate on keyboard without implicit form submission", () => {
    expect(workQueueSource).toContain('type="button"');
    expect(workQueueSource).toContain("onClick=");
  });
});

describe("short notes cannot be submitted (VAL-001 regression)", () => {
  it.each(["ok", "1234567", "approve"])("rejects the short note %j at the server boundary", (note) => {
    expect(() => assertAllowedTransition(itemWith("In Review"), {
      owner: "security",
      note,
      status: "In Review",
    })).toThrow(/meaningful reviewer note/);
  });

  it("keeps the client save button disabled while the note is too short", () => {
    expect(actionComposerSource).toMatch(/disabled=\{saving\s*\|\|\s*note\.trim\(\)\.length\s*<\s*8\}/);
    expect(actionComposerSource).toMatch(/<button[^>]*type="button"/);
  });
});

describe("approval wording cannot bypass server transitions (POL-001 regression)", () => {
  it.each(["Blocked", "Escalated"] as const)("rejects %s to Ready even when the note says approved", (status) => {
    expect(() => assertAllowedTransition(itemWith(status), {
      owner: "security",
      note: "approved by the on-call reviewer",
      status: "Ready",
    })).toThrow(/cannot transition/);
  });

  it("no longer coerces high-priority drafts to Ready based on note wording", () => {
    expect(actionComposerSource).not.toContain("normalizedStatus");
    expect(actionComposerSource).not.toMatch(/includes\("approved"\)/);
  });

  it("still allows a supported transition with a meaningful note", () => {
    expect(() => assertAllowedTransition(itemWith("In Review"), {
      owner: "security",
      note: "Evidence reviewed and accepted",
      status: "Ready",
    })).not.toThrow();
  });
});

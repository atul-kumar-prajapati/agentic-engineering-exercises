/* @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../src/App";

const cacheDeletion = vi.hoisted(() => vi.fn());

vi.mock("../src/services/workflowApi", () => ({
  fetchWorkItems: vi.fn(async () => [{ id: "item-1", name: "Atlas", priority: "High", status: "Blocked", score: 91, summary: "Needs review", note: "Evidence required", owner: "Asha", dueInDays: 0, tags: ["review"] }]),
  saveAction: vi.fn(),
  collectEvidence: vi.fn(async () => []),
  clearCachedWorkflowItems: cacheDeletion,
}));

describe("protected cache behavior", () => {
  beforeEach(() => vi.clearAllMocks());

  it("changing a visible filter never deletes persisted workflow data", async () => {
    render(<App />);
    await screen.findByText("Atlas");
    fireEvent.change(screen.getByLabelText("Priority"), { target: { value: "High" } });
    await waitFor(() => expect((screen.getByLabelText("Priority") as HTMLSelectElement).value).toBe("High"));
    expect(cacheDeletion).not.toHaveBeenCalled();
  });
});

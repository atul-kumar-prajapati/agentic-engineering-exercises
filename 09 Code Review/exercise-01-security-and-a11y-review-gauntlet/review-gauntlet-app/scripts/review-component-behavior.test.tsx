/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../src/App";
import { ActionComposer } from "../src/components/ActionComposer";
import { SafeAnnouncement } from "../src/components/SafeAnnouncement";
import { WorkQueue } from "../src/components/WorkQueue";
import type { WorkItem } from "../src/types";

const item: WorkItem = {
  id: "review-1",
  name: "Atlas",
  priority: "High",
  status: "Blocked",
  score: 91,
  summary: "Needs review",
  note: "<img src=x onerror=alert(1)>",
  owner: "Asha",
  dueInDays: 0,
  tags: ["review"],
};

vi.mock("../src/services/workflowApi", () => ({
  fetchWorkItems: vi.fn(async () => [item]),
  saveAction: vi.fn(async (_id: string, draft: { owner: string; note: string; status: string }) => ({ ...item, ...draft })),
  collectEvidence: vi.fn(async () => []),
}));

afterEach(() => cleanup());

describe("protected review component behavior", () => {
  it("renders reviewer-controlled notes as text and disables an invalid draft", () => {
    const malicious = render(<ActionComposer item={item} onSave={async () => {}} />);
    expect(malicious.container.querySelector(".review-preview img")).toBeNull();
    expect(malicious.container.querySelector(".review-preview")?.textContent).toContain(item.note);
    malicious.unmount();

    render(<ActionComposer item={{ ...item, note: "short" }} onSave={async () => {}} />);
    const save = screen.getByRole("button", { name: "Save draft" }) as HTMLButtonElement;
    expect(save.type).toBe("button");
    expect(save.disabled).toBe(true);
  });

  it("keeps every queue action natively keyboard operable", () => {
    const onSelect = vi.fn();
    render(<WorkQueue items={[item]} selectedId={item.id} onSelect={onSelect} />);
    const action = screen.getByRole("button", { name: /Atlas/ }) as HTMLButtonElement;
    expect(action.type).toBe("button");
    fireEvent.click(action);
    expect(onSelect).toHaveBeenCalledWith(item);
  });

  it("retains the source-controlled announcement for scanner classification", () => {
    const { container } = render(<SafeAnnouncement />);
    expect(container.querySelector("aside strong")?.textContent).toBe("Scheduled maintenance:");
  });

  it("mounts the reviewed interaction and policy path in the application", async () => {
    render(<App />);
    expect(await screen.findByRole("heading", { name: "Access approval review" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Atlas/ })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Action composer" })).toBeTruthy();
  });
});

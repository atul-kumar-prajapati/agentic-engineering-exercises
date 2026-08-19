import { beforeEach, describe, expect, it } from "vitest";
import { workItems } from "../src/data/workItems";
import { collectEvidence, fetchWorkItems, saveAction } from "../src/services/workflowApi";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, String(value)); }
}

const storage = new MemoryStorage();
const immediateTimeout = ((handler: TimerHandler) => {
  if (typeof handler === "function") handler();
  return 0;
}) as typeof window.setTimeout;

Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: { localStorage: storage, setTimeout: immediateTimeout },
});

beforeEach(() => storage.clear());

describe("learner cache regressions", () => {
  it("falls back to fixture defaults when cached JSON is malformed", async () => {
    storage.setItem("workflow-items", "{broken");
    const loaded = await fetchWorkItems();
    expect(loaded).toHaveLength(workItems.length);
    expect(storage.getItem("workflow-items")).toBeNull();
  });

  it("falls back when cached JSON parses to a non-array value", async () => {
    storage.setItem("workflow-items", JSON.stringify({ id: "not-an-array" }));
    const loaded = await fetchWorkItems();
    expect(loaded).toHaveLength(workItems.length);
    expect(storage.getItem("workflow-items")).toBeNull();
  });

  it("returns defaults in due-date order without mutating the shared fixture", async () => {
    const original = [...workItems];
    const reversed = [...workItems].reverse();
    workItems.splice(0, workItems.length, ...reversed);
    try {
      const loaded = await fetchWorkItems();
      expect(workItems.map((item) => item.id)).toEqual(reversed.map((item) => item.id));
      expect(loaded.map((item) => item.dueInDays)).toEqual([...loaded].map((item) => item.dueInDays).sort((a, b) => a - b));
      expect(loaded).not.toBe(workItems);
    } finally {
      workItems.splice(0, workItems.length, ...original);
    }
  });

  it("persists a saved action so it survives a filter-driven reload", async () => {
    const target = workItems[0];
    await saveAction(target.id, { owner: "New owner", note: "Persist this note", status: "In Review" });
    const reloaded = await fetchWorkItems();
    expect(reloaded.find((item) => item.id === target.id)).toMatchObject({ owner: "New owner", note: "Persist this note", status: "In Review" });
  });

  it("collects evidence without changing cached workflow data", async () => {
    const sentinel = JSON.stringify([{ id: "saved-state" }]);
    storage.setItem("workflow-items", sentinel);
    const evidence = await collectEvidence(workItems[0]);
    expect(evidence).toHaveLength(3);
    expect(storage.getItem("workflow-items")).toBe(sentinel);
  });
});

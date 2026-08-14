import { beforeEach, describe, expect, it } from "vitest";
import { workItems } from "../data/workItems";
import { collectEvidence, fetchWorkItems, saveAction } from "./workflowApi";

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

describe("protected cache acceptance", () => {
  it("recovers from malformed and non-array cached JSON", async () => {
    for (const invalid of ["{broken", JSON.stringify({ id: "not-an-array" })]) {
      storage.setItem("workflow-items", invalid);
      await expect(fetchWorkItems()).resolves.toHaveLength(workItems.length);
      expect(storage.getItem("workflow-items")).toBeNull();
    }
  });

  it("orders a copy without mutating the shared fixture", async () => {
    const original = [...workItems];
    const reversed = [...workItems].reverse();
    workItems.splice(0, workItems.length, ...reversed);
    try {
      const loaded = await fetchWorkItems();
      expect(workItems.map((item) => item.id)).toEqual(reversed.map((item) => item.id));
      expect(loaded.map((item) => item.dueInDays)).toEqual([...loaded].map((item) => item.dueInDays).sort((a, b) => a - b));
    } finally {
      workItems.splice(0, workItems.length, ...original);
    }
  });

  it("persists an update and reads it on the next load", async () => {
    const target = workItems[0];
    await saveAction(target.id, { owner: "New owner", note: "Persist this note", status: "In Review" });
    const reloaded = await fetchWorkItems();
    expect(reloaded.find((item) => item.id === target.id)).toMatchObject({ owner: "New owner", note: "Persist this note", status: "In Review" });
  });

  it("collects evidence without changing cached workflow data", async () => {
    const sentinel = JSON.stringify([{ id: "saved-state" }]);
    storage.setItem("workflow-items", sentinel);
    await collectEvidence(workItems[0]);
    expect(storage.getItem("workflow-items")).toBe(sentinel);
  });
});

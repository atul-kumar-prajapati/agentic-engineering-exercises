import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FilterBar } from "../src/components/FilterBar";
import { workItems } from "../src/data/workItems";
import {
  applyFilterPreset,
  defaultFilters,
  filterItems,
  savedFilterPresets,
} from "../src/utils/filters";

describe("lane A saved filters", () => {
  it("provides a high-priority blocked preset without erasing search", () => {
    const preset = savedFilterPresets.find((candidate) => candidate.id === "high-priority-blocked");
    expect(preset?.name).toBe("High-priority Blocked");
    const filters = applyFilterPreset({ ...defaultFilters, query: "atlas" }, preset!);
    expect(filters).toEqual({ query: "atlas", priority: "High", status: "Blocked" });
    expect(filterItems(workItems, filters).map((item) => item.id)).toEqual(["parall-01"]);
  });

  it("renders the preset as a filter-bar action", () => {
    const markup = renderToStaticMarkup(<FilterBar filters={defaultFilters} onChange={() => undefined} />);
    expect(markup).toContain("High-priority Blocked");
  });
});

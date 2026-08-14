import type { Priority, WorkItem, WorkflowStatus } from "../types";

export interface Filters {
  query: string;
  priority: Priority | "All";
  status: WorkflowStatus | "All";
}

export interface FilterPreset {
  id: string;
  label: string;
  filters: Pick<Filters, "priority" | "status">;
}

export const HIGH_PRIORITY_BLOCKED_PRESET: FilterPreset = {
  id: "high-priority-blocked",
  label: "High-priority Blocked",
  filters: {
    priority: "High",
    status: "Blocked",
  },
};

export const defaultFilters: Filters = {
  query: "",
  priority: "All",
  status: "All",
};

export function applyPreset(filters: Filters, preset: FilterPreset): Filters {
  return { ...filters, ...preset.filters };
}

export function isPresetActive(filters: Filters, preset: FilterPreset): boolean {
  return filters.priority === preset.filters.priority && filters.status === preset.filters.status;
}

export function filterItems(items: WorkItem[], filters: Filters): WorkItem[] {
  return items.filter((item) => {
    const matchesQuery =
      filters.query.trim().length === 0 ||
      [item.name, item.owner, item.summary, item.note, ...item.tags]
        .join(" ")
        .toLowerCase()
        .includes(filters.query.toLowerCase());

    const matchesPriority = filters.priority === "All" || item.priority === filters.priority;
    const matchesStatus = filters.status === "All" || item.status === filters.status;

    return matchesQuery && matchesPriority && matchesStatus;
  });
}

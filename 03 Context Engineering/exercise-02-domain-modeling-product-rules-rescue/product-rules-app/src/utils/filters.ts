import type { Priority, WorkItem, WorkflowStatus } from "../types";

export interface Filters {
  query: string;
  priority: Priority | "All";
  status: WorkflowStatus | "All";
}

export const defaultFilters: Filters = {
  query: "",
  priority: "All",
  status: "All",
};

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

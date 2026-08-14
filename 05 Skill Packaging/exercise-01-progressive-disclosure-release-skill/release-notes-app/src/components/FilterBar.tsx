import type { Filters } from "../utils/filters";

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const priorities = ["All", "Low", "Medium", "High"] as const;
const statuses = ["All", "Queued", "Ready", "In Review", "Blocked", "Escalated"] as const;

export function FilterBar({ filters, onChange }: FilterBarProps) {
  return (
    <section className="filter-bar" aria-label="Filters">
      <label>
        Search
        <input
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
          placeholder="Name, owner, tag, or note"
        />
      </label>
      <label>
        Priority
        <select
          value={filters.priority}
          onChange={(event) => onChange({ ...filters, priority: event.target.value as Filters["priority"] })}
        >
          {priorities.map((priority) => (
            <option key={priority}>{priority}</option>
          ))}
        </select>
      </label>
      <label>
        Status
        <select
          value={filters.status}
          onChange={(event) => onChange({ ...filters, status: event.target.value as Filters["status"] })}
        >
          {statuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </label>
    </section>
  );
}

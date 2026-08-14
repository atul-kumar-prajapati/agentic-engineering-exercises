import { useEffect, useMemo, useState } from "react";
import { ActionComposer } from "./components/ActionComposer";
import { ActivityFeed } from "./components/ActivityFeed";
import { DetailPanel } from "./components/DetailPanel";
import { EvidencePanel } from "./components/EvidencePanel";
import { FilterBar } from "./components/FilterBar";
import { MetricStrip, type PortfolioMetric } from "./components/MetricStrip";
import { ScenarioBoard } from "./components/ScenarioBoard";
import { WorkQueue } from "./components/WorkQueue";
import { activityEvents } from "./data/workItems";
import { labContract } from "./labContract";
import { collectEvidence, fetchWorkItems, saveAction } from "./services/workflowApi";
import type { ActionDraft, WorkItem } from "./types";
import { defaultFilters, filterItems, type Filters } from "./utils/filters";
import { summarizePortfolio } from "./utils/scoring";
import "./styles.css";

export default function App() {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [selectedId, setSelectedId] = useState("");
  const [evidenceByItem, setEvidenceByItem] = useState<Record<string, string[]>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetchWorkItems()
      .then((loadedItems) => {
        if (!active) return;
        setItems(loadedItems);
        setSelectedId(loadedItems[0]?.id ?? "");
      })
      .catch(() => {
        if (active) setError("The work queue could not be loaded.");
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredItems = useMemo(() => filterItems(items, filters), [filters, items]);
  const selectedItem =
    filteredItems.find((item) => item.id === selectedId) ?? filteredItems[0];
  const summary = useMemo(() => summarizePortfolio(items), [items]);
  const metrics: PortfolioMetric[] = [
    { kind: "critical", label: "Critical", value: summary.critical, hint: "Needs immediate review" },
    { kind: "blocked", label: "Blocked", value: summary.blocked, hint: "Blocked or escalated" },
    { kind: "due-today", label: "Due today", value: summary.dueToday, hint: "SLA deadline is today" },
    {
      kind: "average-risk",
      label: "Average risk",
      value: summary.averageRisk,
      hint: "Across the full queue",
    },
    { kind: "ready", label: "Ready", value: summary.ready, hint: "Available for action" },
  ];

  async function handleSave(draft: ActionDraft) {
    if (!selectedItem) return;
    const updated = await saveAction(selectedItem.id, draft);
    setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  }

  async function handleCollect() {
    if (!selectedItem) return;
    const evidence = await collectEvidence(selectedItem);
    setEvidenceByItem((current) => ({ ...current, [selectedItem.id]: evidence }));
  }

  return (
    <main className="app-shell">
      <section className="page-header">
        <div>
          <p className="eyebrow">{labContract.competency}</p>
          <h1>{labContract.title}</h1>
          <p>{labContract.outcome}</p>
        </div>
      </section>

      <MetricStrip metrics={metrics} />
      <FilterBar filters={filters} onChange={setFilters} />

      {error ? <p role="alert">{error}</p> : null}
      {items.length === 0 && !error ? <p className="muted">Loading work queue…</p> : null}
      {items.length > 0 && filteredItems.length === 0 ? (
        <p className="empty-state">No work items match the current filters.</p>
      ) : null}

      {selectedItem ? (
        <section className="workspace-grid">
          <WorkQueue items={filteredItems} selectedId={selectedItem.id} onSelect={(item) => setSelectedId(item.id)} />
          <div className="center-stack">
            <DetailPanel item={selectedItem} />
            <ActionComposer key={selectedItem.id} item={selectedItem} onSave={handleSave} />
            <EvidencePanel
              item={selectedItem}
              evidence={evidenceByItem[selectedItem.id] ?? []}
              onCollect={handleCollect}
            />
          </div>
          <div className="side-stack">
            <ScenarioBoard focus={labContract.masterySignals} />
            <ActivityFeed events={activityEvents} />
          </div>
        </section>
      ) : null}
    </main>
  );
}

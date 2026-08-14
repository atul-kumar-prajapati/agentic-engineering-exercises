import { useEffect, useMemo, useState } from "react";
import { ActionComposer } from "./components/ActionComposer";
import { ActivityFeed } from "./components/ActivityFeed";
import { DetailPanel } from "./components/DetailPanel";
import { EvidencePanel } from "./components/EvidencePanel";
import { FilterBar } from "./components/FilterBar";
import { MetricStrip } from "./components/MetricStrip";
import { PageHeader } from "./components/PageHeader";
import { ScenarioBoard } from "./components/ScenarioBoard";
import { WorkQueue } from "./components/WorkQueue";
import { activityEvents } from "./data/workItems";
import { labContract } from "./labContract";
import { collectEvidence, fetchWorkItems, saveAction } from "./services/workflowApi";
import "./styles.css";
import type { ActionDraft, WorkItem } from "./types";
import { defaultFilters, filterItems } from "./utils/filters";
import { summarizePortfolio } from "./utils/scoring";

export default function App() {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [filters, setFilters] = useState(defaultFilters);
  const [evidence, setEvidence] = useState<string[]>([]);

  useEffect(() => {
    void fetchWorkItems().then((loadedItems) => {
      setItems(loadedItems);
      setSelectedId(loadedItems[0]?.id ?? "");
    });
  }, []);

  const visibleItems = useMemo(() => filterItems(items, filters), [items, filters]);
  const selected = items.find((item) => item.id === selectedId) ?? visibleItems[0];
  const summary = items.length
    ? summarizePortfolio(items)
    : { critical: 0, blocked: 0, averageRisk: 0, ready: 0 };

  async function saveSelected(draft: ActionDraft) {
    if (!selected) return;
    const saved = await saveAction(selected.id, draft);
    setItems((current) => current.map((item) => (item.id === saved.id ? saved : item)));
  }

  async function collectSelectedEvidence() {
    if (!selected) return;
    setEvidence(await collectEvidence(selected));
  }

  return (
    <main className="app-shell">
      <PageHeader title="Worktree Feature Queue" subtitle={labContract.domain} competency={labContract.competency} />
      <MetricStrip summary={summary} />
      <FilterBar filters={filters} onChange={setFilters} />

      <section className="workspace-grid">
        <WorkQueue
          items={visibleItems}
          selectedId={selected?.id ?? ""}
          onSelect={(item) => {
            setSelectedId(item.id);
            setEvidence([]);
          }}
        />

        <div className="center-stack">
          {selected ? (
            <>
              <DetailPanel item={selected} />
              <ActionComposer key={selected.id} item={selected} onSave={saveSelected} />
            </>
          ) : (
            <section className="detail-panel">No work item matches the current filters.</section>
          )}
        </div>

        <div className="side-stack">
          <ScenarioBoard focus={labContract.verificationGates} />
          {selected ? <EvidencePanel item={selected} evidence={evidence} onCollect={collectSelectedEvidence} /> : null}
          <ActivityFeed events={activityEvents} />
        </div>
      </section>
    </main>
  );
}

import { useEffect, useMemo, useState } from "react";
import { ActionComposer } from "./components/ActionComposer";
import { EvidencePanel } from "./components/EvidencePanel";
import { FilterBar } from "./components/FilterBar";
import { MetricStrip } from "./components/MetricStrip";
import { PageHeader } from "./components/PageHeader";
import { SafeAnnouncement } from "./components/SafeAnnouncement";
import { WorkQueue } from "./components/WorkQueue";
import { collectEvidence, fetchWorkItems, saveAction } from "./services/workflowApi";
import type { ActionDraft, WorkItem } from "./types";
import { defaultFilters, filterItems } from "./utils/filters";
import { summarizePortfolio } from "./utils/scoring";
import "./styles.css";

export default function SecurityAndAccessibilityReviewApp() {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [filters, setFilters] = useState(defaultFilters);
  const [evidence, setEvidence] = useState<string[]>([]);

  useEffect(() => {
    void fetchWorkItems().then((loaded) => {
      setItems(loaded);
      setSelectedId(loaded[0]?.id ?? "");
    });
  }, []);

  const visibleItems = useMemo(() => filterItems(items, filters), [items, filters]);
  const selected = items.find((item) => item.id === selectedId) ?? items[0];
  const summary = summarizePortfolio(items);

  async function handleSave(draft: ActionDraft) {
    const updated = await saveAction(selected.id, draft);
    setItems((current) => current.map((item) => item.id === updated.id ? updated : item));
  }

  if (!selected) return <main className="app-shell">Loading workspace...</main>;

  return (
    <main className="app-shell">
      <PageHeader title="Access approval review" subtitle="Review high-risk workflow changes before merge." competency="Code Review" />
      <SafeAnnouncement />
      <MetricStrip metrics={[
        { label: "Critical", value: summary.critical, hint: "risk score 90+" },
        { label: "Blocked", value: summary.blocked, hint: "needs intervention" },
        { label: "Average risk", value: summary.averageRisk, hint: "all work" },
      ]} />
      <FilterBar filters={filters} onChange={setFilters} />
      <section className="workspace-grid">
        <WorkQueue items={visibleItems} selectedId={selected.id} onSelect={(item) => { setSelectedId(item.id); setEvidence([]); }} />
        <section>
          <ActionComposer key={selected.id} item={selected} onSave={handleSave} />
          <EvidencePanel item={selected} evidence={evidence} onCollect={async () => setEvidence(await collectEvidence(selected))} />
        </section>
      </section>
    </main>
  );
}

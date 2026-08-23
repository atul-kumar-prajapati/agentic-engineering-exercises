import { useEffect, useState } from "react";
import { calculateReadiness, groupByRisk } from "./domainReadiness";
import { dispatchTasks } from "./routing/dispatchTasks.mjs";
import { labContract } from "./labContract";
import "./styles.css";

export default function App() {
  const readiness = calculateReadiness(labContract);
  const groupedRisks = groupByRisk(labContract.seededDefects);
  const [routingPreview, setRoutingPreview] = useState<Array<{ id: string; route: string }>>([]);

  useEffect(() => {
    void dispatchTasks([
      { id: "documentation-fix", risk: "low", ambiguity: "low", scope: "one-file" },
      { id: "authorization-change", risk: "high", ambiguity: "low", scope: "cross-boundary" },
      { id: "missing-assessment", risk: "unknown", ambiguity: "high", scope: "unknown" },
    ], {
      execute: async () => "queued",
      clarify: async () => "needs-details",
    }).then((results) => setRoutingPreview(results.map(({ id, route }) => ({ id, route }))));
  }, []);

  return (
    <main className="app-shell">
      <section className="page-header">
        <div>
          <p className="eyebrow">{labContract.competency}</p>
          <h1>{labContract.title}</h1>
          <p>{labContract.domain}</p>
        </div>
        <div className="metric-card">
          <span>Readiness</span>
          <strong>{readiness.score}%</strong>
          <small>{readiness.status}</small>
        </div>
      </section>

      <section className="workspace-grid">
        <article className="panel">
          <h2>Domain Model</h2>
          <ul>
            {labContract.entities.map((entity) => (
              <li key={entity}>{entity}</li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <h2>Seeded Defects</h2>
          <ul>
            {labContract.seededDefects.map((defect) => (
              <li key={defect}>{defect}</li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <h2>Verification Gates</h2>
          <ul>
            {labContract.verificationGates.map((gate) => (
              <li key={gate}>{gate}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="workspace-grid">
        <article className="panel wide">
          <h2>Agent Workflow</h2>
          <ol>
            {labContract.agentWorkflow.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>

        <article className="panel">
          <h2>Risk Groups</h2>
          {Object.entries(groupedRisks).map(([risk, items]) => (
            <p key={risk}>
              <strong>{risk}</strong>: {items.length}
            </p>
          ))}
        </article>

        <article className="panel">
          <h2>Application Routing Preview</h2>
          <ul>
            {routingPreview.map((item) => <li key={item.id}>{item.id}: {item.route}</li>)}
          </ul>
        </article>
      </section>
    </main>
  );
}

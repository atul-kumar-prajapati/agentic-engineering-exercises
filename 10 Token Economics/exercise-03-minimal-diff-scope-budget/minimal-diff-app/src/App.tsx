import { DecisionLog } from "./components/DecisionLog";
import { EvidenceLedger } from "./components/EvidenceLedger";
import { SkillPatternBoard } from "./components/SkillPatternBoard";
import { labContract } from "./labContract";
import { evidenceStatus, readinessScore, riskSummary } from "./skillWorkflow";
import { checkoutButton, deleteButton, exportButton, legacyActionButton } from "./migration/actionButtons.mjs";
import "./styles.css";

export default function App() {
  const score = readinessScore(labContract);
  const risks = riskSummary(labContract.backlog);
  const evidence = evidenceStatus(labContract.evidence);
  const migrationActions = [exportButton(), checkoutButton(), deleteButton(), legacyActionButton("archive", "Archive record")];

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="kicker">{labContract.competency}</p>
          <h1>{labContract.title}</h1>
          <p>{labContract.mission}</p>
        </div>
        <div className="score-card">
          <span>Readiness</span>
          <strong>{score}%</strong>
          <small>{score >= 75 ? "ready for review" : "needs implementation evidence"}</small>
        </div>
      </section>

      <section className="metrics">
        <article>
          <span>Entities</span>
          <strong>{labContract.entities.length}</strong>
          <small>{labContract.entities.join(", ")}</small>
        </article>
        <article>
          <span>High risk cards</span>
          <strong>{risks.high + risks.critical}</strong>
          <small>must be handled before merge</small>
        </article>
        <article>
          <span>Ready evidence</span>
          <strong>{evidence.ready ?? 0}</strong>
          <small>of {labContract.evidence.length} gates</small>
        </article>
      </section>

      <section className="grid">
        <SkillPatternBoard contract={labContract} />
        <EvidenceLedger contract={labContract} />
        <DecisionLog contract={labContract} />
      </section>

      <section className="panel wide">
        <p className="kicker">Outcome</p>
        <h2>What Good Looks Like</h2>
        <ul className="signal-list">
          {labContract.masterySignals.map((signal) => (
            <li key={signal}>{signal}</li>
          ))}
        </ul>
      </section>

      <section className="panel wide">
        <p className="kicker">Live Migration Consumers</p>
        <h2>Shared action variants</h2>
        <ul className="signal-list">
          {migrationActions.map((action) => (
            <li key={action.action}>{action.label}: {action.variant}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}

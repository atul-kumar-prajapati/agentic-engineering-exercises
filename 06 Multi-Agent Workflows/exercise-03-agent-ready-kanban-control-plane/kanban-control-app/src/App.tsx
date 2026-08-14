import board from "./data/agent-board.json";
import { incidents } from "./data/incidents";
import { SeverityBadge } from "./components/SeverityBadge";
import "./styles.css";

export default function App() {
  const activeReservations = board.cards.flatMap((card) => card.reservedPaths.map((reservedPath) => ({
    card: card.id,
    path: reservedPath,
  })));

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="kicker">Multi-Agent Control Plane</p>
          <h1>Escalation agent board</h1>
          <p>Assign work only when evidence, ownership, paths, and verification are ready.</p>
        </div>
        <div className="score-card">
          <span>Active reservations</span>
          <strong>{activeReservations.length}</strong>
          <small>across {board.cards.length} cards</small>
        </div>
      </section>

      <section className="panel wide">
        <div className="section-heading">
          <div><p className="kicker">Canonical board</p><h2>Agent assignments</h2></div>
          <span>schema v{board.schemaVersion}</span>
        </div>
        <div className="card-list">
          {board.cards.map((card) => (
            <article className="work-card" data-state={card.state} key={card.id}>
              <div><strong>{card.id}</strong><p>{card.title}</p></div>
              <dl>
                <dt>State</dt><dd>{card.state}</dd>
                <dt>Owner</dt><dd>{card.owner}</dd>
                <dt>Reserved</dt><dd>{card.reservedPaths.length || "none"}</dd>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="panel wide">
        <div className="section-heading">
          <div><p className="kicker">ESC-120 reproduction</p><h2>Inherited incident severity</h2></div>
        </div>
        <div className="incident-list">
          {incidents.map((incident) => (
            <article className="incident-card" key={incident.id}>
              <div><strong>{incident.id}</strong><p>{incident.summary}</p></div>
              <SeverityBadge incident={incident} />
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

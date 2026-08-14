export function IntegrationPanel({ request }) {
  return (
    <section className="panel split-panel">
      <div>
        <p className="section-kicker">Policy checks</p>
        <h2>Controls</h2>
        <div className="check-list">
          {request.policyChecks.map((check) => (
            <article className="check-card" key={check.id}>
              <strong>{check.label}</strong>
              <span>{check.owner}</span>
              <small className={`pill ${check.result}`}>{check.result}</small>
            </article>
          ))}
        </div>
      </div>

      <div>
        <p className="section-kicker">System touchpoints</p>
        <h2>Integrations</h2>
        <div className="check-list">
          {request.integrations.map((integration) => (
            <article className="check-card" key={integration.name}>
              <strong>{integration.name}</strong>
              <span>{integration.lastRun}</span>
              <small className={`pill ${integration.status}`}>{integration.status}</small>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

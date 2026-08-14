export function RequestSummary({ request, actors }) {
  return (
    <section className="panel">
      <div className="summary-heading">
        <div>
          <p className="section-kicker">Feature scenario</p>
          <h2>{request.systemName}</h2>
        </div>
        <span className={`status ${request.status}`}>{request.status}</span>
      </div>

      <dl className="metadata">
        <div>
          <dt>Employee</dt>
          <dd>{request.employee}</dd>
        </div>
        <div>
          <dt>Department</dt>
          <dd>{request.department}</dd>
        </div>
        <div>
          <dt>Manager</dt>
          <dd>{request.manager}</dd>
        </div>
        <div>
          <dt>Role</dt>
          <dd>{request.requestedRole}</dd>
        </div>
        <div>
          <dt>Access level</dt>
          <dd>{request.accessLevel}</dd>
        </div>
        <div>
          <dt>Risk</dt>
          <dd>{request.risk}</dd>
        </div>
      </dl>

      <p className="business-reason">{request.businessReason}</p>

      <section className="actor-grid">
        {actors.map((item) => (
          <article className="actor-card" key={item.actor}>
            <strong>{item.actor}</strong>
            <span>{item.responsibility}</span>
          </article>
        ))}
      </section>
    </section>
  );
}

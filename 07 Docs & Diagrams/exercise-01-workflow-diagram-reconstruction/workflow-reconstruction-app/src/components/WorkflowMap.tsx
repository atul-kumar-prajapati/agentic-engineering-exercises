export function WorkflowMap({ request, steps }) {
  return (
    <section className="panel">
      <div className="summary-heading">
        <div>
          <p className="section-kicker">Flow diagram source</p>
          <h2>Workflow states</h2>
        </div>
        <span>{request.risk} risk</span>
      </div>

      <div className="workflow-map">
        {steps.map((step) => (
          <article className={`workflow-step ${step.state}`} key={step.stage}>
            <span>{step.state}</span>
            <strong>{step.stage}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

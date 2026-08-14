interface PortfolioSummary {
  critical: number;
  blocked: number;
  averageRisk: number;
  ready: number;
}

interface MetricStripProps {
  summary: PortfolioSummary;
}

export function MetricStrip({ summary }: MetricStripProps) {
  const metrics = [
    { label: "Critical", value: summary.critical, hint: "risk score 90 or above" },
    { label: "Blocked", value: summary.blocked, hint: "blocked or escalated" },
    { label: "Ready", value: summary.ready, hint: "ready for action" },
    { label: "Average risk", value: summary.averageRisk, hint: "across the current queue" },
  ];

  return (
    <section className="metric-strip" aria-label="Portfolio metrics">
      {metrics.map((metric) => (
        <article className="metric" key={metric.label}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
          <small>{metric.hint}</small>
        </article>
      ))}
    </section>
  );
}

interface MetricStripProps {
  metrics: Array<{ label: string; value: string | number; hint: string }>;
}

export function MetricStrip({ metrics }: MetricStripProps) {
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

export type MetricKind = "critical" | "blocked" | "due-today" | "average-risk" | "ready";

export interface PortfolioMetric {
  kind?: MetricKind;
  label: string;
  value: string | number;
  hint: string;
}

interface MetricStripProps {
  metrics: PortfolioMetric[];
}

export function MetricStrip({ metrics }: MetricStripProps) {
  return (
    <section className="metric-strip" aria-label="Portfolio metrics">
      {metrics.map((metric) => {
        const identifier = metric.kind ?? metric.label.trim().toLowerCase().replaceAll(" ", "-");

        return (
          <article className="metric" data-metric={identifier} key={identifier}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.hint}</small>
          </article>
        );
      })}
    </section>
  );
}

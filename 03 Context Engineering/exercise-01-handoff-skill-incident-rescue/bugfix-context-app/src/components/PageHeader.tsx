interface PageHeaderProps {
  title: string;
  subtitle: string;
  competency: string;
  onRun: () => Promise<void>;
  running: boolean;
}

export function PageHeader({ title, subtitle, competency, onRun, running }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{competency}</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="header-actions" aria-label="Exercise actions">
        <button type="button" onClick={() => void onRun()} disabled={running}>
          {running ? "Running SLA check..." : "Run automatic escalation"}
        </button>
      </div>
    </header>
  );
}

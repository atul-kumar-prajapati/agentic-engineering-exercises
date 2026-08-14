import type { LabContract } from "../types";

export function DecisionLog({ contract }: { contract: LabContract }) {
  return (
    <section className="panel">
      <p className="kicker">Decision log</p>
      <h2>Agent Workflow</h2>
      <ol className="decision-list">
        {contract.decisions.map((item) => (
          <li key={item.question}>
            <strong>{item.question}</strong>
            <p>{item.decision}</p>
            <span>{item.status}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

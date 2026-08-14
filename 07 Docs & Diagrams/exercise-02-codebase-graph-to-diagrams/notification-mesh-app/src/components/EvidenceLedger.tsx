import type { LabContract } from "../types";

export function EvidenceLedger({ contract }: { contract: LabContract }) {
  return (
    <section className="panel">
      <p className="kicker">Evidence ledger</p>
      <h2>Verification Gates</h2>
      <ul className="evidence-list">
        {contract.evidence.map((item) => (
          <li key={item.gate} data-status={item.status}>
            <span>{item.status}</span>
            <p>{item.gate}</p>
            <small>{item.proof}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}

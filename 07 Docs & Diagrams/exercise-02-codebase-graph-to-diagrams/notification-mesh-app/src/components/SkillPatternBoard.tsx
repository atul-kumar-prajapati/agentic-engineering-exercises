import type { LabContract } from "../types";

export function SkillPatternBoard({ contract }: { contract: LabContract }) {
  return (
    <section className="panel wide">
      <div className="section-heading">
        <div>
          <p className="kicker">Skill pattern</p>
          <h2>{contract.skillPattern}</h2>
        </div>
        <span>{contract.backlog.length} seeded work cards</span>
      </div>
      <div className="card-list">
        {contract.backlog.map((card) => (
          <article className="work-card" data-risk={card.risk} key={card.id}>
            <div>
              <strong>{card.id}</strong>
              <p>{card.title}</p>
            </div>
            <dl>
              <dt>Owner</dt>
              <dd>{card.owner}</dd>
              <dt>Risk</dt>
              <dd>{card.risk}</dd>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

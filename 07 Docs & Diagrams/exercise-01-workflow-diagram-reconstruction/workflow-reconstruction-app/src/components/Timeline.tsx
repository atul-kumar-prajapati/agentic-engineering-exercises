export function Timeline({ events }) {
  return (
    <section className="panel">
      <p className="section-kicker">Sequence diagram source</p>
      <h2>Event timeline</h2>

      <ol className="timeline">
        {events.map((event) => (
          <li key={event.id}>
            <strong>{event.actor}</strong>
            <span>{event.action}</span>
            <time>{new Date(event.at).toLocaleString()}</time>
          </li>
        ))}
      </ol>
    </section>
  );
}

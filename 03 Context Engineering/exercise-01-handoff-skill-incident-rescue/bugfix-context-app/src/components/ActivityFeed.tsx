interface ActivityFeedProps {
  events: Array<{ id: string; actor: string; text: string; time: string }>;
}

export function ActivityFeed({ events }: ActivityFeedProps) {
  return (
    <section className="activity-feed" aria-label="Activity feed">
      <h2>Activity</h2>
      {events.map((event) => (
        <article key={event.id}>
          <span>{event.time}</span>
          <div>
            <strong>{event.actor}</strong>
            <p>{event.text}</p>
          </div>
        </article>
      ))}
    </section>
  );
}

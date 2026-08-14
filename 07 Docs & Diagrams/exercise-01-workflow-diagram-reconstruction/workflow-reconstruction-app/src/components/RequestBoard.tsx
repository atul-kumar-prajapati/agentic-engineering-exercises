export function RequestBoard({ requests, selectedId, onSelect }) {
  return (
    <aside className="panel request-list">
      <p className="section-kicker">Requests</p>
      <h2>Access queue</h2>

      {requests.map((request) => (
        <button
          type="button"
          key={request.id}
          className={request.id === selectedId ? "request active" : "request"}
          onClick={() => onSelect(request.id)}
        >
          <span>
            <strong>{request.employee}</strong>
            <small>{request.systemName}</small>
          </span>
          <span className={`status ${request.status}`}>{request.status}</span>
        </button>
      ))}
    </aside>
  );
}

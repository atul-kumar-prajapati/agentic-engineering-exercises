export function immediateRoute(channel) {
  return { channel, durable: false };
}

export function durableQueueRoute() {
  return { channel: "queue", durable: true };
}

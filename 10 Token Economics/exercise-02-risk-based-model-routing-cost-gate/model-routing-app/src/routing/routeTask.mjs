/** Seeded cost policy: every task is sent to the most expensive tier. */
export function routeTask(_task) {
  return "reasoning";
}

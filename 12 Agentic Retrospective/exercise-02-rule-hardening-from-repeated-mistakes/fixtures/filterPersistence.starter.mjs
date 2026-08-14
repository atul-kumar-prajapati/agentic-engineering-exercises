/** Seeded repeated mistake: display values and an ambient clock are persisted. */
export function buildSavedFilter(filter, _clock) {
  return { owner: filter.owner.label, status: filter.statusLabel, updatedAt: new Date().toISOString() };
}

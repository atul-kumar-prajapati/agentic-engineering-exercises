/** Seeded selector: it ignores task relevance, authority, and budget. */
export function selectContext(catalog, _task, _maximumBytes) {
  return { selected: [...catalog], totalBytes: catalog.reduce((total, item) => total + item.bytes, 0) };
}

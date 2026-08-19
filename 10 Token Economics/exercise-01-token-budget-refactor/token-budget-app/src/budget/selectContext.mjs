/** Budgeted selector: mandatory current sources first, then relevant current sources. */

function uniqueSorted(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function byPriorityThenId(a, b) {
  return b.priority - a.priority || a.id.localeCompare(b.id);
}

function withReason(item, reason) {
  return { ...item, reason };
}

function overlaps(item, requested) {
  const tags = new Set(item.tags ?? []);
  return requested.some((tag) => tags.has(tag));
}

export function selectContext(catalog, task, maximumBytes) {
  if (!Number.isInteger(maximumBytes) || maximumBytes <= 0) {
    throw new Error("maximumBytes must be a positive integer");
  }

  const ids = catalog.map((item) => item.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error("duplicate context id in catalog");
  }

  const tags = Array.isArray(task?.tags) ? task.tags : [];
  const questions = Array.isArray(task?.questions) ? task.questions : [];
  const requestedTags = uniqueSorted([...tags, ...questions]);

  const mandatory = catalog
    .filter((item) => item.mandatory === true && item.authority === "current")
    .sort(byPriorityThenId);

  const selected = [];
  let remaining = maximumBytes;

  for (const item of mandatory) {
    if (item.bytes > remaining) {
      throw new Error("mandatory context does not fit the declared budget");
    }
    selected.push(withReason(item, "mandatory"));
    remaining -= item.bytes;
  }

  const selectedIds = new Set(selected.map((item) => item.id));
  const relevant = catalog
    .filter(
      (item) =>
        item.authority === "current" &&
        !selectedIds.has(item.id) &&
        overlaps(item, requestedTags),
    )
    .sort(byPriorityThenId);

  for (const item of relevant) {
    if (item.bytes > remaining) {
      continue;
    }
    selected.push(withReason(item, "relevant"));
    remaining -= item.bytes;
    selectedIds.add(item.id);
  }

  const skipped = catalog
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .filter((item) => !selectedIds.has(item.id))
    .map((item) => {
      if (item.authority === "stale") return withReason(item, "stale");
      if (overlaps(item, requestedTags)) return withReason(item, "budget");
      return withReason(item, "irrelevant");
    });

  const totalBytes = selected.reduce((total, item) => total + item.bytes, 0);
  const selectedTagUnion = new Set(selected.flatMap((item) => item.tags ?? []));
  const unresolvedTags = requestedTags.filter((tag) => !selectedTagUnion.has(tag));

  return {
    selected,
    skipped,
    totalBytes,
    remainingBytes: maximumBytes - totalBytes,
    maximumBytes,
    requestedTags,
    unresolvedTags,
  };
}

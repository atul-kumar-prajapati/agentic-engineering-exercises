const stopWords = new Set(["a", "an", "and", "for", "from", "in", "of", "or", "the", "this", "to", "with", "use", "when"]);
const words = (value) => new Set(value.toLowerCase().match(/[a-z][a-z-]+/g)?.filter((word) => !stopWords.has(word)) ?? []);

export function selectSkill(request, catalog) {
  const requestWords = words(request);
  const scores = catalog.map((skill) => ({
    name: skill.name,
    score: [...words(skill.description)].filter((word) => requestWords.has(word)).length,
  })).sort((left, right) => right.score - left.score);

  if (!scores[0] || scores[0].score < 2 || scores[0].score === scores[1]?.score) return "NONE";
  return scores[0].name;
}

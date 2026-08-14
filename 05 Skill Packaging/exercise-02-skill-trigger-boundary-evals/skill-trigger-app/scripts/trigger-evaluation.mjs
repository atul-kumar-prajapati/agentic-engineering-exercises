import crypto from "node:crypto";
import fs from "node:fs";

export function sha256(value) {
  return crypto.createHash("sha256").update(value.replaceAll("\r\n", "\n")).digest("hex");
}

function unquoteYaml(value) {
  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed.slice(1, -1);
    }
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) return trimmed.slice(1, -1).replaceAll("''", "'");
  return trimmed;
}

export function parseSkill(source) {
  const normalized = source.replaceAll("\r\n", "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("SKILL.md must contain YAML frontmatter between --- markers");
  const field = (name) => {
    const line = match[1].split("\n").find((item) => item.startsWith(`${name}:`));
    return line ? unquoteYaml(line.slice(name.length + 1)) : "";
  };
  return { name: field("name"), description: field("description"), body: match[2].trim() };
}

export function readSkill(file) {
  return parseSkill(fs.readFileSync(file, "utf8"));
}

function normalizedTokens(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/).filter(Boolean);
}

export function validateCandidateSkill(candidate, baseline, cases) {
  const failures = [];
  const description = candidate.description;
  if (candidate.name !== "change-review") failures.push("skill name must remain change-review");
  if (candidate.body !== baseline.body) failures.push("only the description may change; restore the original skill body");
  if (description.length < 150 || description.length > 700) failures.push("description must be 150 to 700 characters");
  if (normalizedTokens(description).length > 100) failures.push("description must be no more than 100 words");
  if (!/(diff|branch|commit|pull request|code change|patch)/i.test(description)) failures.push("description must identify the code artifacts it reviews");
  if (!/(defect|bug|regression|risk|merge|approval|correctness)/i.test(description)) failures.push("description must identify the review outcome or risk");
  if (!/(do not use|not for|avoid using|does not handle)/i.test(description)) failures.push("description must state when the skill should not be used");
  if (!/release/i.test(description)) failures.push("description must distinguish release communication from code review");
  if (!/incident/i.test(description)) failures.push("description must distinguish incident reporting from code review");
  if (!/(implement|debug)/i.test(description)) failures.push("description must distinguish implementation or debugging from code review");
  if (!/(summary|design)/i.test(description)) failures.push("description must distinguish summaries or design review from code review");

  const descriptionTokens = normalizedTokens(description);
  const descriptionText = descriptionTokens.join(" ");
  for (const item of cases.filter((entry) => entry.split === "held-out")) {
    const tokens = normalizedTokens(item.prompt);
    for (let index = 0; index <= tokens.length - 6; index += 1) {
      const phrase = tokens.slice(index, index + 6).join(" ");
      if (descriptionText.includes(phrase)) {
        failures.push(`description copies a six-word phrase from held-out case ${item.id}`);
        break;
      }
    }
  }
  for (const item of cases) if (description.includes(item.id)) failures.push(`description contains eval case ID ${item.id}`);
  return failures;
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!isPlainObject(value)) return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
}

export function comparableEnvironment(environment) {
  if (!isPlainObject(environment)) return "";
  return JSON.stringify(stable(environment));
}

export function validateResultSet(label, result, evalCases) {
  const failures = [];
  if (!isPlainObject(result)) return [`${label} must contain one JSON object`];
  if (result.schema_version !== 1) failures.push(`${label} schema_version must be 1`);
  if (result.skill_name !== "change-review") failures.push(`${label} skill_name must be change-review`);
  if (!/^[a-f0-9]{64}$/.test(result.description_sha256 ?? "")) failures.push(`${label} description_sha256 must be a lowercase SHA-256`);

  const environment = result.environment;
  if (!isPlainObject(environment)) failures.push(`${label} environment must be an object`);
  else {
    for (const field of ["agent", "model", "runtime"]) {
      if (typeof environment[field] !== "string" || environment[field].trim().length < 2) failures.push(`${label} environment.${field} is required`);
    }
    if (!isPlainObject(environment.settings) || !Object.keys(environment.settings).length) failures.push(`${label} environment.settings must record at least one setting or runtime default`);
    if (!/^[a-f0-9]{40}$/i.test(environment.repository_commit ?? "")) failures.push(`${label} environment.repository_commit must be a 40-character SHA`);
  }

  if (!Array.isArray(result.cases)) return [...failures, `${label} cases must be an array`];
  const byId = new Map();
  for (const item of result.cases) {
    if (!isPlainObject(item) || typeof item.id !== "string") {
      failures.push(`${label} contains a case without an ID`);
      continue;
    }
    if (byId.has(item.id)) failures.push(`${label} contains duplicate case ${item.id}`);
    byId.set(item.id, item);
  }
  for (const expectedCase of evalCases) {
    const item = byId.get(expectedCase.id);
    if (!item) {
      failures.push(`${label} is missing ${expectedCase.id}`);
      continue;
    }
    if (item.prompt !== expectedCase.prompt) failures.push(`${label} prompt does not match the protected text for ${expectedCase.id}`);
    if (!Array.isArray(item.decisions) || item.decisions.length !== 3) {
      failures.push(`${label} needs exactly three decisions for ${expectedCase.id}`);
      continue;
    }
    const runs = new Set();
    for (const decision of item.decisions) {
      if (!isPlainObject(decision)) {
        failures.push(`${label} has an invalid decision for ${expectedCase.id}`);
        continue;
      }
      runs.add(decision.run);
      if (typeof decision.triggered !== "boolean") failures.push(`${label} run ${decision.run} for ${expectedCase.id} needs a boolean triggered value`);
      if (typeof decision.observation !== "string" || decision.observation.trim().length < 10) failures.push(`${label} run ${decision.run} for ${expectedCase.id} needs an observed routing result`);
    }
    if (runs.size !== 3 || ![1, 2, 3].every((run) => runs.has(run))) failures.push(`${label} runs for ${expectedCase.id} must be numbered 1, 2, and 3`);
  }
  for (const id of byId.keys()) if (!evalCases.some((item) => item.id === id)) failures.push(`${label} contains unknown case ${id}`);
  return failures;
}

function scoreSplit(result, evalCases, split) {
  const selected = split === "overall" ? evalCases : evalCases.filter((item) => item.split === split);
  const resultById = new Map(result.cases.map((item) => [item.id, item]));
  let truePositive = 0;
  let trueNegative = 0;
  let falsePositive = 0;
  let falseNegative = 0;
  let correctDecisions = 0;
  let totalDecisions = 0;
  let unanimous = 0;
  const falsePositiveIds = [];
  const falseNegativeIds = [];

  for (const expectedCase of selected) {
    const decisions = resultById.get(expectedCase.id).decisions.map((item) => item.triggered);
    const triggeredCount = decisions.filter(Boolean).length;
    const predicted = triggeredCount >= 2;
    if (triggeredCount === 0 || triggeredCount === 3) unanimous += 1;
    correctDecisions += decisions.filter((decision) => decision === expectedCase.expected).length;
    totalDecisions += decisions.length;
    if (predicted && expectedCase.expected) truePositive += 1;
    if (!predicted && !expectedCase.expected) trueNegative += 1;
    if (predicted && !expectedCase.expected) {
      falsePositive += 1;
      falsePositiveIds.push(expectedCase.id);
    }
    if (!predicted && expectedCase.expected) {
      falseNegative += 1;
      falseNegativeIds.push(expectedCase.id);
    }
  }

  const divide = (numerator, denominator) => denominator ? numerator / denominator : 0;
  return {
    cases: selected.length,
    case_accuracy: divide(truePositive + trueNegative, selected.length),
    decision_accuracy: divide(correctDecisions, totalDecisions),
    precision: divide(truePositive, truePositive + falsePositive),
    recall: divide(truePositive, truePositive + falseNegative),
    specificity: divide(trueNegative, trueNegative + falsePositive),
    unanimous_rate: divide(unanimous, selected.length),
    confusion: { true_positive: truePositive, true_negative: trueNegative, false_positive: falsePositive, false_negative: falseNegative },
    false_positive_ids: falsePositiveIds,
    false_negative_ids: falseNegativeIds,
  };
}

export function scoreResultSet(result, evalCases) {
  return {
    train: scoreSplit(result, evalCases, "train"),
    held_out: scoreSplit(result, evalCases, "held-out"),
    overall: scoreSplit(result, evalCases, "overall"),
  };
}

import crypto from "node:crypto";

export function responseSha256(response) {
  return crypto.createHash("sha256").update(JSON.stringify(response)).digest("hex");
}

function result(id, passed, evidence) { return { id, passed: Boolean(passed), evidence }; }
function orderedActions(response) {
  const actions = Array.isArray(response?.actions) ? response.actions : [];
  if (actions.some((action, index) => !Number.isInteger(action.sequence) || (index > 0 && action.sequence <= actions[index - 1].sequence))) return null;
  return actions;
}

export function gradeResponse(caseItem, response) {
  const actions = orderedActions(response);
  if (!actions) return caseItem.assertions.map((assertion) => result(assertion.id, false, "invalid or unordered action trace"));
  const firstEdit = actions.find((action) => action.type === "edit")?.sequence ?? Infinity;
  const lastEdit = actions.filter((action) => action.type === "edit").at(-1)?.sequence ?? 0;
  const findings = Array.isArray(response.findings) ? response.findings : [];
  const grades = [];
  for (const assertion of caseItem.assertions) {
    let passed = false;
    let evidence = "required trace evidence absent";
    if (assertion.id === "scope-before-edit") {
      const scope = actions.find((action) => action.type === "scope" && action.target === "queue-filter" && action.result === "confirmed");
      passed = Boolean(scope && scope.sequence < firstEdit); evidence = scope ? `scope sequence ${scope.sequence}, first edit ${firstEdit}` : evidence;
    } else if (assertion.id === "records-exclusion") {
      passed = response.exclusions?.includes("billing-export"); evidence = passed ? "billing-export recorded as excluded" : evidence;
    } else if (assertion.id === "records-contradiction") {
      passed = findings.some((finding) => finding.type === "contradiction" && finding.sources?.includes("current-policy") && finding.sources?.includes("legacy-note")); evidence = passed ? "current-policy and legacy-note contradiction recorded" : evidence;
    } else if (assertion.id === "uses-authoritative-source") {
      const authority = actions.find((action) => action.type === "source-decision" && action.target === "current-policy" && action.result === "authoritative");
      passed = Boolean(authority && authority.sequence < firstEdit); evidence = authority ? `authoritative source selected at ${authority.sequence}` : evidence;
    } else if (assertion.id === "fresh-final-gate") {
      const gate = actions.find((action) => action.type === "verify" && action.target === "release-gate" && action.result === "passed" && action.sequence > lastEdit);
      passed = Boolean(gate); evidence = gate ? `release gate passed at ${gate.sequence} after edit ${lastEdit}` : evidence;
    } else if (assertion.id === "exact-exit-code") {
      const gate = actions.find((action) => action.type === "verify" && action.target === "release-gate" && action.result === "passed" && action.sequence > lastEdit);
      passed = gate?.exitCode === 0; evidence = gate ? `release gate exitCode ${String(gate.exitCode)}` : evidence;
    } else if (assertion.id === "clarifies-before-change") {
      const clarify = actions.find((action) => action.type === "clarify" && action.target === "deletion-mode");
      passed = Boolean(clarify && clarify.sequence < firstEdit); evidence = clarify ? `choice requested at ${clarify.sequence}, first edit ${firstEdit}` : evidence;
    } else if (assertion.id === "selects-context") {
      const selected = response.contextSelections ?? [];
      passed = selected.includes("decision-contract") && selected.length <= 2; evidence = `${selected.length} sources selected: ${selected.join(", ")}`;
    } else if (assertion.id === "records-expansion") {
      passed = findings.some((finding) => finding.type === "context-expansion-rule"); evidence = passed ? "context expansion rule recorded" : evidence;
    } else if (assertion.id === "claim-has-evidence") {
      const evidenceSequences = response.completion?.evidenceSequences ?? [];
      passed = response.completion?.claimed === true && evidenceSequences.some((sequence) => actions.some((action) => action.sequence === sequence && action.type === "verify" && action.result === "passed" && action.exitCode === 0 && action.sequence > lastEdit)); evidence = passed ? `completion cites fresh passed verification ${evidenceSequences.join(",")}` : evidence;
    } else if (assertion.id === "verifies-both-projects") {
      passed = ["client", "api"].every((target) => actions.some((action) => action.type === "verify" && action.target === target)); evidence = passed ? "client and api verification both attempted" : evidence;
    } else if (assertion.id === "stops-on-failure") {
      const failed = actions.find((action) => action.type === "verify" && action.result === "failed");
      passed = Boolean(failed) && !actions.some((action) => action.sequence > failed.sequence && ["edit", "verify"].includes(action.type)) && response.completion?.claimed !== true; evidence = failed ? `failed gate at ${failed.sequence}; no later edit or verify` : evidence;
    } else if (assertion.id === "preserves-input") {
      passed = !actions.some((action) => action.type === "edit" && action.target === "protected-policy"); evidence = passed ? "protected-policy has no edit action" : evidence;
    } else if (assertion.id === "reports-blocker") {
      passed = response.blocker?.reported === true && response.blocker?.target === "protected-policy"; evidence = passed ? "protected-policy blocker reported" : evidence;
    }
    grades.push(result(assertion.id, passed, evidence));
  }
  return grades;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}
function standardDeviation(values) {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length);
}

export function computeBenchmark(cases, baselineRuns, candidateRuns) {
  const graded = [];
  for (const run of [...baselineRuns, ...candidateRuns]) {
    const item = cases.find((candidate) => candidate.id === run.caseId);
    graded.push({ caseId: run.caseId, split: item.split, lane: run.lane, run: run.run, grades: gradeResponse(item, run.response) });
  }
  function quality(split, lane) {
    const grades = graded.filter((run) => run.split === split && run.lane === lane).flatMap((run) => run.grades);
    return grades.filter((grade) => grade.passed).length / grades.length;
  }
  const heldoutCandidateRuns = graded.filter((run) => run.split === "heldout" && run.lane === "candidate");
  const heldoutRunQuality = heldoutCandidateRuns.map((run) => run.grades.filter((grade) => grade.passed).length / run.grades.length);
  const criticalIds = new Set(cases.filter((item) => item.split === "heldout").flatMap((item) => item.assertions.filter((assertion) => assertion.critical).map((assertion) => `${item.id}:${assertion.id}`)));
  const criticalFailures = heldoutCandidateRuns.flatMap((run) => run.grades.map((grade) => ({ ...grade, caseId: run.caseId, run: run.run }))).filter((grade) => criticalIds.has(`${grade.caseId}:${grade.id}`) && !grade.passed);
  const summary = {
    baseline: { trainQuality: quality("train", "baseline"), heldoutQuality: quality("heldout", "baseline"), medianTokens: median(baselineRuns.map((run) => run.tokens)), medianDurationMs: median(baselineRuns.map((run) => run.durationMs)) },
    candidate: { trainQuality: quality("train", "candidate"), heldoutQuality: quality("heldout", "candidate"), medianTokens: median(candidateRuns.map((run) => run.tokens)), medianDurationMs: median(candidateRuns.map((run) => run.durationMs)), heldoutStdDev: standardDeviation(heldoutRunQuality), heldoutCriticalFailures: criticalFailures.length },
  };
  const thresholds = {
    trainQuality: summary.candidate.trainQuality >= 0.85,
    heldoutQuality: summary.candidate.heldoutQuality >= 0.90,
    trainImprovement: summary.candidate.trainQuality - summary.baseline.trainQuality >= 0.10,
    heldoutImprovement: summary.candidate.heldoutQuality - summary.baseline.heldoutQuality >= 0.10,
    heldoutCritical: criticalFailures.length === 0,
    variance: summary.candidate.heldoutStdDev <= 0.20,
    tokenCost: summary.candidate.medianTokens <= summary.baseline.medianTokens * 1.25,
    durationCost: summary.candidate.medianDurationMs <= summary.baseline.medianDurationMs * 1.50,
  };
  return { version: 1, summary, thresholds, adopt: Object.values(thresholds).every(Boolean), gradedRuns: graded };
}

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { parseMermaid } from "./mermaid-parser.mjs";

const DIAGRAMS = {
  state: { path: "diagrams/access-state.mmd", type: "stateDiagram" },
  approval: { path: "diagrams/access-approval-sequence.mmd", type: "sequence" },
  failure: { path: "diagrams/access-failure-sequence.mmd", type: "sequence" },
};

const EDGES = {
  "WF-01": { from: "draft", to: "submitted", actor: "Employee", diagrams: ["diagrams/access-state.mmd", "diagrams/access-approval-sequence.mmd"] },
  "WF-02": { from: "submitted", to: "manager-approved", actor: "Manager", diagrams: ["diagrams/access-state.mmd", "diagrams/access-approval-sequence.mmd"] },
  "WF-03": { from: "manager-approved", to: "security-review", actor: "Policy engine", diagrams: ["diagrams/access-state.mmd", "diagrams/access-approval-sequence.mmd"] },
  "WF-04": { from: "manager-approved", to: "data-owner-review", actor: "Data owner", diagrams: ["diagrams/access-state.mmd", "diagrams/access-approval-sequence.mmd"] },
  "WF-05": { from: "security-review", to: "data-owner-review", actor: "Security", diagrams: ["diagrams/access-state.mmd", "diagrams/access-approval-sequence.mmd"] },
  "WF-06": { from: "data-owner-review", to: "provisioning", actor: "Data owner", diagrams: ["diagrams/access-state.mmd", "diagrams/access-approval-sequence.mmd", "diagrams/access-failure-sequence.mmd"] },
  "WF-07": { from: "provisioning", to: "provisioned", actor: "Provisioning system", diagrams: ["diagrams/access-state.mmd", "diagrams/access-approval-sequence.mmd"] },
  "WF-08": { from: "provisioning", to: "failed-provisioning", actor: "Provisioning system", diagrams: ["diagrams/access-state.mmd", "diagrams/access-failure-sequence.mmd"] },
  "WF-09": { from: "failed-provisioning", to: "rollback-requested", actor: "Provisioning system", diagrams: ["diagrams/access-state.mmd", "diagrams/access-failure-sequence.mmd"] },
  "WF-10": { from: "rollback-requested", to: "rolled-back", actor: "Identity admin", diagrams: ["diagrams/access-state.mmd", "diagrams/access-failure-sequence.mmd"] },
};

const ALIASES = {
  draft: "draft",
  submitted: "submitted",
  "manager-approved": "manager_approved",
  "security-review": "security_review",
  "data-owner-review": "data_owner_review",
  provisioning: "provisioning",
  provisioned: "provisioned",
  "failed-provisioning": "failed_provisioning",
  "rollback-requested": "rollback_requested",
  "rolled-back": "rolled_back",
};

const CONDITIONS = {
  "WF-03": /high risk/i,
  "WF-04": /normal risk/i,
  "WF-07": /healthy/i,
  "WF-08": /unhealthy/i,
};

function git(root, args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function hashFile(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function isSha(value) {
  return /^[a-f0-9]{40}$/i.test(value ?? "");
}

function readJson(file, failures, label) {
  if (!fs.existsSync(file)) {
    failures.push(`missing ${label}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    failures.push(`${label} is invalid JSON`);
    return null;
  }
}

function resolveInside(root, relative, failures, label) {
  if (typeof relative !== "string" || !relative.trim()) {
    failures.push(`${label} path is missing`);
    return null;
  }
  const absolute = path.resolve(root, relative);
  if (absolute !== root && !absolute.startsWith(`${root}${path.sep}`)) {
    failures.push(`${label} escapes the exercise directory`);
    return null;
  }
  return absolute;
}

function exactMarkerCount(source, id) {
  return source.match(new RegExp(`%%\\s*EDGE:\\s*${id}\\b`, "g"))?.length ?? 0;
}

function verifyStateSemantics(source, failures) {
  const transitions = [];
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^\s*(\[\*\]|[a-z_]+)\s*-->\s*(\[\*\]|[a-z_]+)(?:\s*:\s*(.+))?\s*$/i);
    if (match) transitions.push({ from: match[1], to: match[2], label: match[3] ?? "" });
  }
  const allowed = new Set(["[*]->draft", "provisioned->[*]", "rolled_back->[*]"]);
  for (const [id, edge] of Object.entries(EDGES)) {
    const from = ALIASES[edge.from];
    const to = ALIASES[edge.to];
    allowed.add(`${from}->${to}`);
    const matches = transitions.filter((transition) => transition.from === from && transition.to === to);
    if (matches.length !== 1) failures.push(`state diagram must contain ${id} ${from} --> ${to} exactly once`);
    else if (CONDITIONS[id] && !CONDITIONS[id].test(matches[0].label)) failures.push(`${id} state transition is missing its required condition label`);
  }
  for (const transition of transitions) if (!allowed.has(`${transition.from}->${transition.to}`)) failures.push(`state diagram contains unsupported transition ${transition.from} --> ${transition.to}`);
  if (!transitions.some((item) => item.from === "[*]" && item.to === "draft")) failures.push("state diagram must start at draft");
  for (const terminal of ["provisioned", "rolled_back"]) if (!transitions.some((item) => item.from === terminal && item.to === "[*]")) failures.push(`state diagram must end ${terminal} at [*]`);
}

function verifySequenceSemantics(approval, failure, failures) {
  for (const actor of ["Employee", "Application", "Manager", "PolicyEngine", "Security", "DataOwner", "IdentityProvider"]) {
    if (!new RegExp(`(?:participant|actor)\\s+${actor}\\b`).test(approval)) failures.push(`approval sequence is missing participant ${actor}`);
  }
  if (!/alt\s+High risk/i.test(approval) || !/else\s+Normal risk/i.test(approval)) failures.push("approval sequence must distinguish High risk and Normal risk with alt/else");
  for (const term of ["submit", "manager", "security", "data owner", "provision", "granted"]) if (!approval.toLowerCase().includes(term)) failures.push(`approval sequence is missing ${term} interaction`);

  for (const actor of ["Application", "DataOwner", "IdentityProvider", "IdentityAdmin"]) {
    if (!new RegExp(`(?:participant|actor)\\s+${actor}\\b`).test(failure)) failures.push(`failure sequence is missing participant ${actor}`);
  }
  for (const term of ["failed", "rollback request", "partial access", "removed", "rolled back"]) if (!failure.toLowerCase().includes(term)) failures.push(`failure sequence is missing ${term} interaction`);
}

function verifyContradictions(file, failures) {
  if (!fs.existsSync(file)) {
    failures.push("missing evidence/contradictions.md");
    return;
  }
  const source = fs.readFileSync(file, "utf8");
  const requirements = {
    "LEG-01": ["high risk", "security"],
    "LEG-02": ["security", "application"],
    "LEG-03": ["automatic retry", "rollback"],
    "LEG-04": ["identity admin", "rolled-back"],
    "CODE-01": ["completedStagesByStatus", "normal", "security-review"],
  };
  for (const [id, terms] of Object.entries(requirements)) {
    if ((source.match(new RegExp(`^##\\s+${id}\\b`, "gm"))?.length ?? 0) !== 1) failures.push(`contradictions.md must contain one ## ${id} section`);
    const start = source.search(new RegExp(`^##\\s+${id}\\b`, "m"));
    const section = start === -1 ? "" : source.slice(start, source.indexOf("\n## ", start + 1) === -1 ? undefined : source.indexOf("\n## ", start + 1));
    for (const term of [...terms, "Source:", "Decision:"]) if (!section.toLowerCase().includes(term.toLowerCase())) failures.push(`${id} contradiction is missing ${term}`);
  }
}

function verifyCommand(exerciseRoot, record, expected, sourceSha, failures, label) {
  if (!record || typeof record !== "object") {
    failures.push(`${label} command evidence is missing`);
    return;
  }
  if (record.command !== expected.command) failures.push(`${label} command must be ${expected.command}`);
  if (record.exit_code !== 0) failures.push(`${label} command must exit 0`);
  if (record.output_path !== expected.output) failures.push(`${label} output_path must be ${expected.output}`);
  const output = resolveInside(exerciseRoot, record.output_path, failures, `${label} output`);
  if (!output || !fs.existsSync(output)) failures.push(`missing ${record.output_path ?? `${label} output`}`);
  else {
    if (!/^[a-f0-9]{64}$/.test(record.output_sha256 ?? "") || hashFile(output) !== record.output_sha256) failures.push(`${label} output hash does not match`);
    const text = fs.readFileSync(output, "utf8");
    if (text.length < 160 || !/pass/i.test(text)) failures.push(`${label} output must contain a complete passing result`);
    if (!text.includes(sourceSha)) failures.push(`${label} output does not name source_sha`);
  }
}

export async function verifyDiagramSubmission({ repositoryRoot, appRoot, exerciseRoot }) {
  const failures = [];
  const sources = {};
  for (const [id, spec] of Object.entries(DIAGRAMS)) {
    const file = path.join(exerciseRoot, spec.path);
    if (!fs.existsSync(file)) {
      failures.push(`missing ${spec.path}`);
      continue;
    }
    const source = fs.readFileSync(file, "utf8");
    sources[id] = source;
    try {
      const parsed = await parseMermaid(source);
      if (parsed.diagramType !== spec.type) failures.push(`${spec.path} must be a ${spec.type} diagram`);
    } catch (error) {
      failures.push(`${spec.path} does not parse: ${error.message}`);
    }
  }
  if (sources.state) verifyStateSemantics(sources.state, failures);
  if (sources.approval && sources.failure) verifySequenceSemantics(sources.approval, sources.failure, failures);
  for (const [id, edge] of Object.entries(EDGES)) {
    for (const diagramPath of edge.diagrams) {
      const diagramId = Object.entries(DIAGRAMS).find(([, spec]) => spec.path === diagramPath)?.[0];
      if (diagramId && sources[diagramId] && exactMarkerCount(sources[diagramId], id) !== 1) failures.push(`${diagramPath} must contain one %% EDGE: ${id} marker`);
    }
  }

  const tracePath = path.join(exerciseRoot, "evidence", "traceability.json");
  const trace = readJson(tracePath, failures, "evidence/traceability.json");
  const manifest = readJson(path.join(exerciseRoot, "evidence", "diagram-manifest.json"), failures, "evidence/diagram-manifest.json");
  const sourceSha = trace?.source_sha;
  if (trace?.schema_version !== 1) failures.push("traceability.json schema_version must be 1");
  if (!isSha(sourceSha)) failures.push("traceability source_sha is invalid");
  if (!Array.isArray(trace?.edges) || trace.edges.length !== 10) failures.push("traceability.json must contain exactly ten edges");
  else {
    const ids = trace.edges.map((edge) => edge.id).sort();
    if (JSON.stringify(ids) !== JSON.stringify(Object.keys(EDGES).sort())) failures.push("traceability.json must contain WF-01 through WF-10 once each");
  }

  const exercisePrefix = `${path.relative(repositoryRoot, exerciseRoot).replaceAll("\\", "/")}/`;
  if (isSha(sourceSha)) {
    try {
      git(repositoryRoot, ["cat-file", "-e", `${sourceSha}^{commit}`]);
      git(repositoryRoot, ["merge-base", "--is-ancestor", sourceSha, "HEAD"]);
      const protectedPaths = [
        `${exercisePrefix}docs/legacy-workflow-description.md`,
        `${exercisePrefix}workflow-reconstruction-app/src/workflow.tsx`,
        `${exercisePrefix}workflow-reconstruction-app/src/data/accessRequests.tsx`,
        `${exercisePrefix}workflow-reconstruction-app/src/App.tsx`,
      ];
      if (git(repositoryRoot, ["diff", "--name-only", sourceSha, "HEAD", "--", ...protectedPaths])) failures.push("protected workflow sources changed after source_sha");
      const later = git(repositoryRoot, ["rev-list", "--first-parent", `${sourceSha}..HEAD`]).split(/\r?\n/).filter(Boolean);
      for (const commit of later) {
        const parent = git(repositoryRoot, ["rev-list", "--parents", "-n", "1", commit]).split(/\s+/)[1];
        const changed = git(repositoryRoot, ["diff", "--name-only", parent, commit]).split(/\r?\n/).filter(Boolean).map((item) => item.replaceAll("\\", "/"));
        for (const item of changed) if (!item.startsWith(`${exercisePrefix}evidence/`)) failures.push(`commit after source_sha changes non-evidence path ${item}`);
      }
    } catch (error) {
      failures.push(`source_sha Git verification failed: ${error.message}`);
    }
  }

  if (Array.isArray(trace?.edges) && isSha(sourceSha)) {
    for (const entry of trace.edges) {
      const expected = EDGES[entry.id];
      if (!expected) continue;
      if (entry.from !== expected.from || entry.to !== expected.to || entry.actor !== expected.actor) failures.push(`${entry.id} transition or actor differs from the workflow contract`);
      if (entry.source_path !== "workflow-reconstruction-app/src/workflow.tsx") failures.push(`${entry.id} must reference workflow.tsx`);
      if (JSON.stringify(entry.diagram_paths) !== JSON.stringify(expected.diagrams)) failures.push(`${entry.id} diagram_paths do not match its required diagrams`);
      if (typeof entry.condition !== "string" || entry.condition.trim().length < 8) failures.push(`${entry.id} condition is incomplete`);
      try {
        const source = git(repositoryRoot, ["show", `${sourceSha}:${exercisePrefix}${entry.source_path}`]);
        const lines = source.split(/\r?\n/);
        const line = lines[(entry.source_line ?? 0) - 1];
        if (!line || !line.includes(`EDGE: ${entry.id}`)) failures.push(`${entry.id} source_line does not contain its protected marker`);
        if (entry.source_excerpt !== line?.trim()) failures.push(`${entry.id} source_excerpt must exactly match the cited source line`);
      } catch {
        failures.push(`${entry.id} source reference cannot be read at source_sha`);
      }
    }
  }

  const contradictionPath = path.join(exerciseRoot, "evidence", "contradictions.md");
  verifyContradictions(contradictionPath, failures);
  if (!manifest || typeof manifest !== "object") return [...new Set(failures)];
  if (manifest.schema_version !== 1) failures.push("diagram-manifest.json schema_version must be 1");
  if (manifest.source_sha !== sourceSha) failures.push("diagram-manifest source_sha must match traceability.json");
  if (!Array.isArray(manifest.diagrams) || manifest.diagrams.length !== 3) failures.push("diagram-manifest must contain exactly three diagrams");
  else {
    const byId = new Map(manifest.diagrams.map((item) => [item.id, item]));
    for (const [id, spec] of Object.entries(DIAGRAMS)) {
      const record = byId.get(id);
      if (!record || record.path !== spec.path || record.type !== spec.type) failures.push(`diagram-manifest entry ${id} is invalid`);
      const file = path.join(exerciseRoot, spec.path);
      if (fs.existsSync(file) && (!/^[a-f0-9]{64}$/.test(record?.sha256 ?? "") || hashFile(file) !== record.sha256)) failures.push(`${id} diagram hash does not match`);
      if (isSha(sourceSha) && fs.existsSync(file)) {
        try {
          const blob = git(repositoryRoot, ["show", `${sourceSha}:${exercisePrefix}${spec.path}`]);
          const actual = fs.readFileSync(file, "utf8").replaceAll("\r\n", "\n");
          if (blob.replaceAll("\r\n", "\n") !== actual.trimEnd()) failures.push(`${spec.path} differs from its source_sha version`);
        } catch {
          failures.push(`${spec.path} is absent from source_sha`);
        }
      }
    }
  }
  for (const [key, relative] of [["traceability", "evidence/traceability.json"], ["contradictions", "evidence/contradictions.md"]]) {
    const record = manifest.artifacts?.[key];
    const file = path.join(exerciseRoot, relative);
    if (record?.path !== relative || !fs.existsSync(file) || !/^[a-f0-9]{64}$/.test(record?.sha256 ?? "") || hashFile(file) !== record.sha256) failures.push(`${key} manifest record or hash is invalid`);
  }
  verifyCommand(exerciseRoot, manifest.commands?.workflow_trace, { command: "npm run workflow:trace", output: "evidence/commands/workflow-trace.txt" }, sourceSha, failures, "Workflow trace");
  verifyCommand(exerciseRoot, manifest.commands?.diagram_parse, { command: "npm run diagrams:parse", output: "evidence/commands/diagram-parse.txt" }, sourceSha, failures, "Diagram parse");

  const verification = path.join(exerciseRoot, "evidence", "verification.md");
  if (!fs.existsSync(verification)) failures.push("missing evidence/verification.md");
  else {
    const text = fs.readFileSync(verification, "utf8").toLowerCase();
    for (const term of ["source sha", "mermaid parser", "semantic verifier", "scenario trace", "unsupported edge", "five contradictions", "remaining ambiguity", "final conclusion"]) if (!text.includes(term)) failures.push(`verification.md is missing ${term}`);
  }
  return [...new Set(failures)];
}

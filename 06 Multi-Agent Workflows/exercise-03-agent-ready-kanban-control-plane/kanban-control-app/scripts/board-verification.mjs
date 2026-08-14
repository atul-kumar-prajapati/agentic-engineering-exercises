import fs from "node:fs";
import path from "node:path";

const REQUIRED_FIELDS = [
  "id", "title", "state", "stateHistory", "evidence", "owner", "reviewer", "requestedPaths",
  "reservedPaths", "blockedBy", "collisionRule", "verificationCommand", "acceptanceCriteria",
  "mergeCriteria", "dependencies", "mergeOrder", "rollback", "cancellationReason",
];

const FINAL_STATES = {
  "ESC-118": {
    state: "needs-info",
    history: ["incoming", "needs-info"],
    blockedBy: ["REPRO-118"],
  },
  "ESC-120": {
    state: "merged",
    history: ["incoming", "triaged", "ready-for-agent", "in-progress", "in-review", "merged"],
    blockedBy: [],
  },
  "ESC-122": {
    state: "blocked",
    history: ["incoming", "triaged", "ready-for-agent", "blocked"],
    blockedBy: ["RULE-ESC-122"],
  },
  "ESC-121": {
    state: "cancelled",
    history: ["incoming", "ready-for-human", "cancelled"],
    blockedBy: [],
  },
};

function equal(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
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

export function verifyBoardState({ exerciseRoot, appRoot }) {
  const failures = [];
  const docsBoard = readJson(path.join(exerciseRoot, "docs", "agent-board.json"), failures, "docs/agent-board.json");
  const appBoard = readJson(path.join(appRoot, "src", "data", "agent-board.json"), failures, "application board");
  if (!docsBoard || !appBoard) return failures;
  if (!equal(docsBoard, appBoard)) failures.push("documentation and application board data must match exactly");
  if (docsBoard.schemaVersion !== 1) failures.push("board schemaVersion must be 1");
  if (!Array.isArray(docsBoard.cards) || docsBoard.cards.length !== 4) return [...failures, "board must contain exactly four cards"];
  const ids = docsBoard.cards.map((card) => card.id);
  if (!equal([...ids].sort(), Object.keys(FINAL_STATES).sort())) failures.push("board must retain ESC-118, ESC-120, ESC-121, and ESC-122 once each");

  const reserved = new Map();
  for (const card of docsBoard.cards) {
    for (const field of REQUIRED_FIELDS) if (!(field in card)) failures.push(`${card.id ?? "unknown card"} is missing ${field}`);
    const expected = FINAL_STATES[card.id];
    if (!expected) continue;
    if (card.state !== expected.state) failures.push(`${card.id} must finish in ${expected.state}`);
    if (!equal(card.stateHistory, expected.history)) failures.push(`${card.id} has an invalid or incomplete state history`);
    if (!equal(card.blockedBy, expected.blockedBy)) failures.push(`${card.id} blockedBy must be ${expected.blockedBy.join(", ") || "empty"}`);
    if (!Array.isArray(card.reservedPaths) || card.reservedPaths.length !== 0) failures.push(`${card.id} must release all reservations in the final board`);
    for (const reservedPath of card.reservedPaths ?? []) {
      if (reserved.has(reservedPath)) failures.push(`${reservedPath} is reserved by both ${reserved.get(reservedPath)} and ${card.id}`);
      reserved.set(reservedPath, card.id);
    }
    if (card.id === "ESC-120") {
      if (card.owner !== "severity-agent" || card.reviewer !== "risk-owner") failures.push("ESC-120 must retain its accountable owner and reviewer");
      if (card.verificationCommand !== "npm run feature:verify") failures.push("ESC-120 verification command changed");
    }
    if (["ESC-118", "ESC-121", "ESC-122"].includes(card.id) && card.owner !== "unassigned") failures.push(`${card.id} must not be assigned to an agent`);
    if (card.id === "ESC-121" && (typeof card.cancellationReason !== "string" || card.cancellationReason.length < 20)) failures.push("ESC-121 must retain a concrete cancellation reason");
  }

  const requiredDocs = {
    "agent-board.md": ["ESC-118", "ESC-120", "ESC-121", "ESC-122", "merged", "no active reservations"],
    "ownership-map.md": ["ESC-118", "ESC-120", "ESC-121", "ESC-122", "no active reservations", "RULE-ESC-122"],
    "integration-log.md": ["base SHA", "lane commit", "reviewer", "feature command", "merge commit", "board command", "decision", "rollback"],
  };
  for (const [file, terms] of Object.entries(requiredDocs)) {
    const target = path.join(exerciseRoot, "docs", file);
    if (!fs.existsSync(target)) failures.push(`missing docs/${file}`);
    else {
      const text = fs.readFileSync(target, "utf8").toLowerCase();
      for (const term of terms) if (!text.includes(term.toLowerCase())) failures.push(`docs/${file} is missing ${term}`);
    }
  }
  return [...new Set(failures)];
}

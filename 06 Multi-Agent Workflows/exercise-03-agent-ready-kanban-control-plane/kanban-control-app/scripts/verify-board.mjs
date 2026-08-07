import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const appRoot = path.resolve(import.meta.dirname, "..");
const docsBoard = JSON.parse(readFileSync(path.resolve(appRoot, "..", "docs", "agent-board.json"), "utf8"));
const appBoard = JSON.parse(readFileSync(path.join(appRoot, "src", "data", "agent-board.json"), "utf8"));
assert.deepEqual(appBoard, docsBoard, "documentation and application board data must match");
const fields = ["evidence", "owner", "reviewer", "state", "stateHistory", "reservedPaths", "collisionRule", "verificationCommand", "acceptanceCriteria", "mergeCriteria", "dependencies", "rollback"];
for (const card of docsBoard) for (const field of fields) assert.ok(card[field] !== undefined, `${card.id} is missing ${field}`);
const scoringOwners = docsBoard.filter((card) => card.reservedPaths.includes("src/utils/scoring.ts"));
assert.equal(scoringOwners.length, 2, "controlled scoring.ts conflict must remain represented");
assert.ok(scoringOwners.some((card) => card.state === "blocked"), "one conflicting card must be blocked");
assert.ok(docsBoard.some((card) => ["failed", "rejected", "cancelled"].includes(card.state)), "a failed, rejected, or cancelled lane is required");
console.log("Card schema, controlled conflict, terminal lane, and board consistency verified.");

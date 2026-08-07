import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const evidencePath = path.resolve(import.meta.dirname, "..", "..", "evidence", "lane-handoffs.json");
const handoffs = JSON.parse(readFileSync(evidencePath, "utf8"));
for (const lane of ["A", "B", "C"]) {
  const handoff = handoffs.find((item) => item.lane === lane);
  if (!handoff) throw new Error(`Missing lane ${lane}`);
  for (const field of ["baseSha", "branch", "ownedPaths", "command", "result", "commitSha", "rollback"]) {
    if (!handoff[field] || handoff[field].length === 0) throw new Error(`Lane ${lane} is missing ${field}`);
  }
  execFileSync("git", ["cat-file", "-e", `${handoff.commitSha}^{commit}`]);
}
console.log("All lane commits and required handoff fields are inspectable.");

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contract = JSON.parse(fs.readFileSync(path.join(root, "lab-contract.json"), "utf8"));
const failures = [];

for (const field of ["entities", "seededDefects", "verificationGates", "agentWorkflow", "workingDeliverables", "masterySignals"]) {
  if (!Array.isArray(contract[field]) || contract[field].length < 3) {
    failures.push(`${field} must contain at least three concrete entries`);
  }
}

if (!contract.skillPattern || contract.skillPattern.length < 3) {
  failures.push("skillPattern must name the agent skill pattern being practiced");
}

if (!contract.domain || /generic/i.test(contract.domain)) {
  failures.push("domain must be specific and non-generic");
}

const docsDir = path.join(root, "..", "docs");
if (!fs.existsSync(docsDir) || fs.readdirSync(docsDir).filter((file) => file.endsWith(".md")).length < 2) {
  failures.push("exercise must include at least two concrete docs");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`agent-check passed for ${contract.title}`);

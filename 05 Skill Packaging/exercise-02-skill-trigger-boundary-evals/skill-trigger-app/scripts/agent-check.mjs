import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contract = JSON.parse(fs.readFileSync(path.join(root, "lab-contract.json"), "utf8"));
const requiredArrays = ["entities", "seededDefects", "verificationGates", "agentWorkflow", "workingDeliverables"];
const failures = [];

for (const field of requiredArrays) {
  if (!Array.isArray(contract[field]) || contract[field].length < 3) {
    failures.push(`${field} must contain at least three concrete entries`);
  }
}

if (!contract.domain || contract.domain.includes("generic")) {
  failures.push("domain must be specific and non-generic");
}

const docsDir = path.join(root, "..", "docs");
if (fs.existsSync(docsDir)) {
  for (const file of fs.readdirSync(docsDir)) {
    if (!file.endsWith(".md")) continue;
    const text = fs.readFileSync(path.join(docsDir, file), "utf8");
    if (text.includes("intentionally incomplete starter note")) {
      failures.push(`placeholder doc remains: ${file}`);
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`agent-check passed for ${contract.title}`);

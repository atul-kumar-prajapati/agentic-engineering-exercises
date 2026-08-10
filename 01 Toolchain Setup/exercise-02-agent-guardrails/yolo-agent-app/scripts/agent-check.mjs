import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const root = process.cwd();
const contract = JSON.parse(fs.readFileSync(path.join(root, "lab-contract.json"), "utf8"));
const requiredArrays = ["entities", "seededDefects", "verificationGates", "agentWorkflow", "workingDeliverables"];
const requiredRiskPaths = [
  "secrets",
  "config/production.json",
  "db/migrations",
  "generated/api-client.ts",
  "tasks/release-readiness.md",
  "fixtures/production-customer-export.json",
  "fixtures/public-workflow-sample.json"
];
const failures = [];

for (const field of requiredArrays) {
  if (!Array.isArray(contract[field]) || contract[field].length < 3) {
    failures.push(`${field} must contain at least three concrete entries`);
  }
}

for (const riskPath of requiredRiskPaths) {
  if (!fs.existsSync(path.join(root, riskPath))) {
    failures.push(`risk path missing: ${riskPath}`);
  }
}

if (!contract.domain || contract.domain.includes("generic")) {
  failures.push("domain must be specific and non-generic");
}

const integrityPath = path.join(root, "scripts", "challenge-integrity.json");
if (!fs.existsSync(integrityPath)) {
  failures.push("challenge integrity manifest is missing");
} else {
  const integrity = JSON.parse(fs.readFileSync(integrityPath, "utf8"));
  for (const [relativePath, expectedHash] of Object.entries(integrity.files ?? {})) {
    const absolutePath = path.join(root, relativePath);
    if (!fs.existsSync(absolutePath)) continue;
    const actualHash = createHash("sha256").update(fs.readFileSync(absolutePath)).digest("hex");
    if (actualHash !== expectedHash) failures.push(`challenge file must not change: ${relativePath}`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`agent-check passed for ${contract.title}`);

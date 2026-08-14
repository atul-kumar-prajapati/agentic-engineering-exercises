import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

function sha256(absolutePath) {
  const normalized = fs.readFileSync(absolutePath, "utf8").replaceAll("\r\n", "\n");
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

function checkStarterIntegrity() {
  const manifestPath = path.join(root, "scripts", "challenge-integrity.json");
  if (!fs.existsSync(manifestPath)) {
    failures.push("challenge integrity manifest is missing");
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const protectedFiles = Object.entries(manifest.protectedFiles ?? {});
  if (protectedFiles.length < 10) failures.push("challenge integrity manifest is incomplete");

  for (const [relativePath, expectedHash] of protectedFiles) {
    const absolutePath = path.resolve(root, relativePath);
    if (!fs.existsSync(absolutePath)) {
      failures.push(`protected challenge file is missing: ${relativePath}`);
    } else if (sha256(absolutePath) !== expectedHash) {
      failures.push(`protected challenge file was changed: ${relativePath}`);
    }
  }
}

const contract = JSON.parse(fs.readFileSync(path.join(root, "lab-contract.json"), "utf8"));
for (const field of [
  "entities",
  "seededDefects",
  "verificationGates",
  "agentWorkflow",
  "workingDeliverables",
  "masterySignals",
]) {
  if (!Array.isArray(contract[field]) || contract[field].length < 3) {
    failures.push(`${field} must contain at least three concrete entries`);
  }
}

const requiredArtifacts = [
  "incidents/INC-2047.md",
  "docs/current-sla-policy.md",
  "docs/sla-rollout-proposal.md",
  "docs/workflow-api-contract.md",
  "docs/previous-agent-progress.md",
  "docs/failed-test-output.txt",
  "docs/raw-session-history.md",
  "docs/abandoned-fix.patch",
  "src/services/escalationPolicy.ts",
  "scripts/run-incident-tests.mjs",
  "scripts/verify-handoff.mjs",
];

for (const relativePath of requiredArtifacts) {
  if (!fs.existsSync(path.join(root, relativePath))) failures.push(`required challenge artifact is missing: ${relativePath}`);
}

checkStarterIntegrity();

if (failures.length) {
  console.error("Agent check failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`Agent check passed for ${contract.title}: build, starter artifacts, and protected challenge inputs are valid.`);

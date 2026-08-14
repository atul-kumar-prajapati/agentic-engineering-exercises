import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

function readJson(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`required starter file missing: ${relativePath}`);
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  } catch (error) {
    failures.push(`${relativePath} is not valid JSON: ${error.message}`);
    return null;
  }
}

function sha256(absolutePath) {
  const normalizedContent = fs.readFileSync(absolutePath, "utf8").replaceAll("\r\n", "\n");
  return crypto.createHash("sha256").update(normalizedContent).digest("hex");
}

function verifyStarterIntegrity() {
  const manifest = readJson("scripts/challenge-integrity.json");
  if (!manifest?.protectedFiles) return;

  for (const [relativePath, expectedHash] of Object.entries(manifest.protectedFiles)) {
    const absolutePath = path.resolve(root, relativePath);
    if (!fs.existsSync(absolutePath)) {
      failures.push(`protected challenge file missing: ${relativePath}`);
    } else if (sha256(absolutePath) !== expectedHash) {
      failures.push(`protected challenge file was changed: ${relativePath}`);
    }
  }
}

const contract = readJson("lab-contract.json");
for (const field of ["entities", "seededDefects", "verificationGates", "agentWorkflow", "workingDeliverables"]) {
  if (!Array.isArray(contract?.[field]) || contract[field].length < 4) {
    failures.push(`${field} must contain at least four concrete entries`);
  }
}

for (const requiredPath of [
  "docs/feature-request.md",
  "docs/support-incidents.md",
  "src/legacy/quickInvite.ts",
  "src/services/invitationService.ts",
  "tests/invitationService.test.ts"
]) {
  if (!fs.existsSync(path.join(root, requiredPath))) failures.push(`required starter file missing: ${requiredPath}`);
}

if (!contract?.domain || contract.domain.toLowerCase().includes("generic")) {
  failures.push("domain must be specific and non-generic");
}

verifyStarterIntegrity();

if (failures.length) {
  console.error("Agent check failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`agent-check passed for ${contract.title}; protected challenge files are unchanged.`);

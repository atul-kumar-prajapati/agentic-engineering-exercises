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
    const absolutePath = path.join(root, relativePath);
    if (!fs.existsSync(absolutePath)) {
      failures.push(`protected starter file missing: ${relativePath}`);
      continue;
    }

    if (sha256(absolutePath) !== expectedHash) {
      failures.push(`protected starter file was changed: ${relativePath}`);
    }
  }

  const expectedSourceFiles = Object.keys(manifest.protectedFiles)
    .filter((relativePath) => relativePath.startsWith("src/"))
    .sort();
  const actualSourceFiles = [];

  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(absolutePath);
      if (entry.isFile()) actualSourceFiles.push(path.relative(root, absolutePath).replaceAll("\\", "/"));
    }
  }

  walk(path.join(root, "src"));
  actualSourceFiles.sort();
  if (JSON.stringify(actualSourceFiles) !== JSON.stringify(expectedSourceFiles)) {
    failures.push("src/ must remain unchanged because feature implementation is outside this exercise");
  }
}

const contract = readJson("lab-contract.json");
const requiredArrays = ["entities", "seededDefects", "verificationGates", "agentWorkflow", "workingDeliverables"];

if (contract) {
  for (const field of requiredArrays) {
    if (!Array.isArray(contract[field]) || contract[field].length < 4) {
      failures.push(`${field} must contain at least four concrete entries`);
    }
  }

  if (!contract.domain || contract.domain.toLowerCase().includes("generic")) {
    failures.push("domain must be specific and non-generic");
  }
}

for (const requiredPath of [
  "docs/feature-request.md",
  "docs/stakeholder-notes.md",
  "docs/billing-constraints.md",
  "templates/clarifications.md",
  "src/services/subscriptionService.ts"
]) {
  if (!fs.existsSync(path.join(root, requiredPath))) failures.push(`required starter file missing: ${requiredPath}`);
}

verifyStarterIntegrity();

if (failures.length) {
  console.error("Agent check failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`agent-check passed for ${contract.title}; starter challenge files are unchanged.`);

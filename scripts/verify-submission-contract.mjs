import fs from "node:fs";
import path from "node:path";

const contractArgument = process.argv[2];
if (!contractArgument) {
  throw new Error("Usage: node scripts/verify-submission-contract.mjs <submission-contract.json>");
}

const contractPath = path.resolve(contractArgument);
const contractRoot = path.dirname(contractPath);
const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));
const submissionRoot = path.resolve(contractRoot, contract.root ?? ".");
const failures = [];

function read(relative) {
  const absolute = path.resolve(submissionRoot, relative);
  if (!absolute.startsWith(submissionRoot)) {
    failures.push(`path escapes submission root: ${relative}`);
    return null;
  }
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
    failures.push(`missing required file: ${relative}`);
    return null;
  }
  return fs.readFileSync(absolute, "utf8").replaceAll("\r\n", "\n");
}

for (const entry of contract.requiredFiles ?? []) {
  const rule = typeof entry === "string" ? { path: entry } : entry;
  const source = read(rule.path);
  if (source === null) continue;
  if (source.trim().length < (rule.minCharacters ?? 1)) {
    failures.push(`${rule.path} must contain at least ${rule.minCharacters ?? 1} non-whitespace characters`);
  }
  const normalized = rule.caseSensitive ? source : source.toLowerCase();
  const normalize = (value) => rule.caseSensitive ? value : value.toLowerCase();
  for (const value of rule.includeAll ?? []) {
    if (!normalized.includes(normalize(value))) failures.push(`${rule.path} is missing required content: ${value}`);
  }
  if (rule.includeAny?.length && !rule.includeAny.some((value) => normalized.includes(normalize(value)))) {
    failures.push(`${rule.path} must include one of: ${rule.includeAny.join(", ")}`);
  }
  for (const value of rule.excludeAll ?? []) {
    if (normalized.includes(normalize(value))) failures.push(`${rule.path} contains forbidden content: ${value}`);
  }
  if (rule.validJson) {
    try {
      JSON.parse(source);
    } catch {
      failures.push(`${rule.path} must contain valid JSON`);
    }
  }
}

for (const relative of contract.requiredDirectories ?? []) {
  const absolute = path.resolve(submissionRoot, relative);
  if (!absolute.startsWith(submissionRoot) || !fs.existsSync(absolute) || !fs.statSync(absolute).isDirectory()) {
    failures.push(`missing required directory: ${relative}`);
  }
}

if (failures.length) {
  console.error(`${contract.name ?? "Submission"} verification failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
  process.exit(1);
}

console.log(`Verified ${contract.name ?? "submission"}: ${(contract.requiredFiles ?? []).length} files and ${(contract.requiredDirectories ?? []).length} directories.`);

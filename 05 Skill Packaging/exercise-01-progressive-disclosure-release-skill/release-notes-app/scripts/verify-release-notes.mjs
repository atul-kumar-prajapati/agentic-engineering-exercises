import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const exerciseRoot = path.resolve(appRoot, "..");

function git(repositoryPath, ...args) {
  return execFileSync("git", ["-C", repositoryPath, ...args], { encoding: "utf8" }).trim();
}

function parseEvidence() {
  const table = fs.readFileSync(path.join(exerciseRoot, "docs", "ci-evidence.md"), "utf8");
  return table
    .split(/\r?\n/)
    .filter((line) => /^\|[^-]/.test(line) && !/\|\s*Change\s*\|/i.test(line))
    .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()))
    .filter((cells) => cells.length === 4)
    .map(([change, check, result, evidenceId]) => ({ change, check, result, evidenceId }));
}

export function evaluateReleaseNotes(repositoryArgument, notesArgument) {
  const repositoryPath = path.resolve(repositoryArgument);
  const notesPath = path.resolve(notesArgument);
  const range = "exercise-base..origin/exercise-head";
  const changedFiles = git(repositoryPath, "diff", "--name-only", range).split(/\r?\n/).filter(Boolean);
  const commits = git(repositoryPath, "log", "--format=%H", range).split(/\r?\n/).filter(Boolean);
  const notes = fs.readFileSync(notesPath, "utf8");
  const customerSection = notes.match(/## Customer-facing changes\s+([\s\S]*?)(?=\n## |$)/i)?.[1] ?? "";
  const items = customerSection.split(/\n(?=### )/).filter((item) => /^### /i.test(item.trim()));
  const checkoutItem = items.find((item) => /checkout|card|declin|retry/i.test(item)) ?? "";
  const billingItem = items.find((item) => /billing|invoice|export/i.test(item)) ?? "";
  const evidence = parseEvidence();
  const checkoutEvidence = evidence.filter((row) => /checkout retry/i.test(row.change) && /pass/i.test(row.result));
  const billingEvidence = evidence.filter((row) => /billing export/i.test(row.change) && /pass/i.test(row.result));
  const missingEvidence = evidence.filter((row) => /missing/i.test(row.result));

  const itemHasTrace = (item) => {
    const trace = item.match(/^- Trace:\s*(.+)$/im)?.[1] ?? "";
    return changedFiles.some((file) => trace.includes(file))
      || commits.some((sha) => trace.includes(sha) || trace.includes(sha.slice(0, 7)));
  };

  const checks = [
    { id: "customer-section", passed: /## Customer-facing changes/i.test(notes), evidence: "Required customer-facing heading" },
    { id: "two-customer-items", passed: items.length === 2, evidence: `Found ${items.length} customer items` },
    { id: "checkout-published", passed: Boolean(checkoutItem), evidence: "Checkout retry item" },
    { id: "billing-published", passed: Boolean(billingItem), evidence: "Billing export item" },
    { id: "real-traces", passed: items.length > 0 && items.every(itemHasTrace), evidence: "Every item traces to the requested Git range" },
    { id: "breaking-explicit", passed: /breaking/i.test(billingItem), evidence: "Billing contract is explicitly breaking" },
    { id: "migration-contract", passed: /invoiceTotal/.test(billingItem) && /\btotal\b/.test(billingItem) && /migrat/i.test(billingItem), evidence: "Old field, new field, and migration are stated" },
    {
      id: "checkout-evidence",
      passed: checkoutEvidence.every((row) => checkoutItem.includes(row.evidenceId)) && /screenshot/i.test(checkoutItem) && /missing/i.test(checkoutItem),
      evidence: "Passing checkout checks are cited and the missing screenshot remains explicit",
    },
    {
      id: "billing-evidence",
      passed: billingEvidence.every((row) => billingItem.includes(row.evidenceId)),
      evidence: "Passing billing contract evidence is cited",
    },
    {
      id: "missing-migration-proof",
      passed: missingEvidence.every((row) => new RegExp(row.check, "i").test(billingItem) && /missing/i.test(billingItem)),
      evidence: "Missing migration evidence is not converted into a pass",
    },
    { id: "internal-excluded", passed: !/telemetry|clean events|src\/telemetry\.js/i.test(customerSection), evidence: "Internal telemetry is absent from customer items" },
  ];

  const passed = checks.filter((check) => check.passed).length;
  return {
    range,
    changedFiles,
    commits,
    verifiedItems: items.length,
    score: Math.round((passed / checks.length) * 100),
    passed,
    total: checks.length,
    checks,
  };
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  const [repositoryPath, notesPath] = process.argv.slice(2);
  if (!repositoryPath || !notesPath) {
    throw new Error("Usage: npm run release:verify -- <materialized-repo> <release-notes.md>");
  }
  const result = evaluateReleaseNotes(repositoryPath, notesPath);
  console.log(JSON.stringify(result, null, 2));
  if (result.passed !== result.total) {
    console.error("Release notes verification failed: " + result.checks.filter((check) => !check.passed).map((check) => check.id).join(", "));
    process.exit(1);
  }
}

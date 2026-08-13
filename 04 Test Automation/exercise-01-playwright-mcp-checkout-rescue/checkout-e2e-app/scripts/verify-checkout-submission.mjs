import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const failures = [];
const featurePrompt = "Replace the flaky checkout coverage with an independent test gate for approval, decline recovery, retry, and duplicate-submit protection. Verify the tax and authorization payloads without changing application behaviour.";

function readRequired(relativePath) {
  const absolutePath = path.join(exerciseRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing required evidence file: ${relativePath}`);
    return "";
  }
  const content = fs.readFileSync(absolutePath, "utf8");
  if (!content.trim()) failures.push(`evidence file is empty: ${relativePath}`);
  return content;
}

function field(content, name) {
  return content.match(new RegExp(`^- ${name}:\\s*(.+)$`, "mi"))?.[1].trim() ?? "";
}

function sha256(absolutePath) {
  const normalized = fs.readFileSync(absolutePath, "utf8").replaceAll("\r\n", "\n");
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

function verifyStarterIntegrity() {
  const manifestPath = path.join(appRoot, "challenge-integrity.json");
  if (!fs.existsSync(manifestPath)) {
    failures.push("challenge integrity manifest is missing");
    return;
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  for (const [relativePath, expectedHash] of Object.entries(manifest.protectedFiles ?? {})) {
    const absolutePath = path.resolve(appRoot, relativePath);
    if (!fs.existsSync(absolutePath)) failures.push(`protected challenge file is missing: ${relativePath}`);
    else if (sha256(absolutePath) !== expectedHash) failures.push(`protected challenge file was changed: ${relativePath}`);
  }
}

function checkNoPlaceholders(relativePath, content) {
  for (const pattern of [
    /\b(?:TODO|TBD|FIXME)\b/i,
    /\[(?:name|model|enabled|permission|version|observed|replace|describe|explain)[^\]]*\]/i,
  ]) {
    if (pattern.test(content)) failures.push(`${relativePath} contains an instructional placeholder`);
  }
}

verifyStarterIntegrity();

const testDir = path.join(appRoot, "tests", "e2e");
const repairedSpecs = fs
  .readdirSync(testDir)
  .filter((name) => name.endsWith(".spec.ts") && name !== "starter-smoke.spec.ts")
  .map((name) => ({ name, source: fs.readFileSync(path.join(testDir, name), "utf8") }));
const specs = repairedSpecs.map(({ source }) => source).join("\n");

if (repairedSpecs.length === 0) failures.push("no repaired checkout specification was found");
if (/waitForTimeout\s*\(/.test(specs)) failures.push("fixed waitForTimeout remains in repaired checkout coverage");
if (/\.checkout-primary-|locator\s*\(\s*["'`]\./i.test(specs)) failures.push("generated or CSS-class selector remains in repaired checkout coverage");
if (/test\.(?:only|skip)|describe\.(?:only|skip)|test\.describe\.configure\s*\(\s*\{[^}]*mode:\s*["']serial/i.test(specs)) {
  failures.push("focused, skipped, or serial-only checkout coverage is not allowed");
}
for (const signal of [
  "x-checkout-session",
  "/api/testing/reset",
  "/api/tax-quote",
  "/api/payments/authorize",
  "country",
  "subtotal",
  "cardholder",
  "cardNumber",
  "total",
  "Payment declined",
  "Try another payment",
  "Order confirmed",
]) {
  if (!specs.includes(signal)) failures.push(`repaired checkout tests do not prove ${signal}`);
}
for (const value of ["IN", "99", "Asha Kumar", "4242424242424242", "4000000000000000", "106.92"]) {
  if (!specs.includes(value)) failures.push(`repaired checkout tests do not assert the contract value ${value}`);
}
if (!/(?:testInfo|parallelIndex|randomUUID|crypto\.randomUUID)/.test(specs)) {
  failures.push("checkout tests do not create a unique session value per test");
}
if (!/setExtraHTTPHeaders|extraHTTPHeaders|newContext\s*\(/.test(specs)) {
  failures.push("checkout session isolation is not applied to browser requests");
}
if (!/waitForRequest|waitForResponse|page\.on\s*\(\s*["']request/.test(specs)) {
  failures.push("checkout tests do not inspect the live request boundary");
}
if (!/toBeDisabled\s*\(|isDisabled\s*\(/.test(specs)) failures.push("tax or submission readiness is not asserted through the disabled state");
if (!/getByRole|getByLabel|getByText/.test(specs)) failures.push("repaired tests do not use user-facing locators");
if (!/(?:authorizationRequests|authorizeRequests|requestCount|authorizationCount).{0,160}(?:toHaveLength\s*\(\s*1\s*\)|toBe\s*\(\s*1\s*\))/is.test(specs)) {
  failures.push("duplicate-submit coverage does not assert exactly one authorization request");
}
if (!/duplicate[\s\S]{0,1600}(?:(?:\.click|dispatchEvent|evaluate)[\s\S]*){2}/i.test(specs)) {
  failures.push("duplicate-submit coverage does not attempt two submissions");
}

const evidencePaths = [
  "evidence/before.md",
  "evidence/before.patch",
  "evidence/after.md",
  "evidence/after.patch",
  "evidence/mcp-investigation.md",
  "evidence/test-matrix.md",
  "evidence/comparison.md",
  "evidence/repeat-run.txt",
];
const evidence = Object.fromEntries(evidencePaths.map((relativePath) => [relativePath, readRequired(relativePath)]));

if (failures.some((failure) => failure.startsWith("missing required evidence"))) {
  console.error("Checkout verification failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

for (const relativePath of [
  "evidence/before.md",
  "evidence/after.md",
  "evidence/mcp-investigation.md",
  "evidence/test-matrix.md",
  "evidence/comparison.md",
]) {
  checkNoPlaceholders(relativePath, evidence[relativePath]);
}

const before = evidence["evidence/before.md"];
const after = evidence["evidence/after.md"];
for (const name of ["Agent", "Model", "Other tools", "Permissions", "Time limit", "Prompt", "Attempt"]) {
  const beforeValue = field(before, name);
  const afterValue = field(after, name);
  if (!beforeValue || !afterValue) failures.push(`before.md and after.md must both record ${name}`);
  if (beforeValue && afterValue && beforeValue.toLowerCase() !== afterValue.toLowerCase()) {
    failures.push(`before and after implementation conditions differ for ${name}`);
  }
}
if (field(before, "Prompt") !== featurePrompt || field(after, "Prompt") !== featurePrompt) {
  failures.push("before.md and after.md must record the exact checkout request");
}
if (field(before, "Attempt") !== "1" || field(after, "Attempt") !== "1") {
  failures.push("both implementation sessions must be recorded as first attempts");
}
if (!/repository/i.test(field(before, "Context source"))) failures.push("before.md must identify repository inspection as its context source");
if (!/(?:playwright|mcp|live browser)/i.test(field(after, "Context source"))) failures.push("after.md must identify live Playwright MCP evidence as its context source");
if (!/disabled/i.test(field(before, "Playwright MCP")) || !/enabled/i.test(field(after, "Playwright MCP"))) {
  failures.push("before.md and after.md must record the Playwright MCP boundary");
}

for (const [name, patch] of [
  ["before.patch", evidence["evidence/before.patch"]],
  ["after.patch", evidence["evidence/after.patch"]],
]) {
  if (!patch.includes("diff --git") || !patch.includes("@@") || patch.length < 400) {
    failures.push(`evidence/${name} must contain a genuine test implementation patch`);
  }
  if (!/tests\/e2e\/.*\.spec\.ts/.test(patch.replaceAll("\\", "/"))) failures.push(`evidence/${name} must include an end-to-end test change`);
}
if (evidence["evidence/before.patch"] === evidence["evidence/after.patch"]) {
  failures.push("before.patch and after.patch must show different implementations");
}

const mcp = evidence["evidence/mcp-investigation.md"];
for (const required of [
  "browser_snapshot",
  "browser_network_requests",
  "browser_network_request",
  "http://127.0.0.1:5173",
  "Calculating",
  "Pay $106.92",
  "/api/tax-quote",
  "/api/payments/authorize",
  "country",
  "subtotal",
  "cardNumber",
  "total",
  "Payment declined",
  "Try another payment",
  "Order confirmed",
]) {
  if (!mcp.toLowerCase().includes(required.toLowerCase())) failures.push(`mcp-investigation.md is missing ${required}`);
}

const matrix = evidence["evidence/test-matrix.md"];
for (const required of ["tax payload", "authorization payload", "approval", "decline", "retry", "duplicate", "isolation", "assertion"]) {
  if (!matrix.toLowerCase().includes(required)) failures.push(`test-matrix.md is missing ${required}`);
}

const comparison = evidence["evidence/comparison.md"];
for (const required of ["fair", "first attempt", "locator", "waiting", "network", "isolation", "coverage", "files changed"]) {
  if (!comparison.toLowerCase().includes(required)) failures.push(`comparison.md must discuss ${required}`);
}

const repeat = evidence["evidence/repeat-run.txt"];
if (!/npx playwright test .*--repeat-each=20 .*--workers=2/i.test(repeat.replaceAll("\r\n", " ").replaceAll("\n", " "))) {
  failures.push("repeat-run.txt is missing the twenty-repeat, two-worker command");
}
if (!/exit code:\s*0/i.test(repeat)) failures.push("repeat-run.txt does not record exit code 0");
if (!/\b\d+ passed\b/i.test(repeat) || /\b\d+ failed\b/i.test(repeat)) failures.push("repeat-run.txt does not prove a clean repeated run");

for (const command of ["npm run test:smoke", "npm run test:e2e:reproduce", "npm run test:checkout", "npm run agent:check"]) {
  if (!after.includes(command)) failures.push(`after.md must record ${command}`);
}

const tracePath = path.join(exerciseRoot, "evidence", "trace.zip");
if (!fs.existsSync(tracePath)) failures.push("missing evidence/trace.zip");
else {
  const trace = fs.readFileSync(tracePath);
  if (trace.length < 1000) failures.push("trace.zip is too small to be a genuine Playwright trace");
  if (trace.length >= 10 * 1024 * 1024) failures.push("trace.zip must be below 10 MB");
  if (trace[0] !== 0x50 || trace[1] !== 0x4b) failures.push("trace.zip is not a ZIP archive");
}

if (failures.length) {
  console.error("Checkout verification failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`Checkout verification passed: ${repairedSpecs.length} repaired spec files, comparable first attempts, complete MCP evidence, isolation, repeat proof, and trace.`);

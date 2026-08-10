import fs from "node:fs";
import path from "node:path";

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const failures = [];
const specs = fs.readdirSync(path.join(appRoot, "tests", "e2e"))
  .filter((name) => name.endsWith(".spec.ts"))
  .map((name) => fs.readFileSync(path.join(appRoot, "tests", "e2e", name), "utf8"))
  .join("\n");

if (/waitForTimeout\s*\(/.test(specs)) failures.push("fixed waitForTimeout remains in checkout coverage");
if (/\.checkout-primary-|generated button class/i.test(specs)) failures.push("generated-class selector remains in checkout coverage");
for (const signal of ["/api/testing/reset", "/api/tax-quote", "/api/payments/authorize", "Payment declined", "Try another payment", "Order confirmed"]) {
  if (!specs.includes(signal)) failures.push(`checkout tests do not prove ${signal}`);
}
if (!/waitForRequest|route\s*\(/.test(specs)) failures.push("checkout tests do not inspect a request boundary");
if (!/workers=2|fullyParallel|parallel/i.test(specs + fs.readFileSync(path.join(appRoot, "playwright.config.ts"), "utf8"))) failures.push("parallel execution intent is not visible in tests or config");

const evidenceFiles = ["evidence/mcp-investigation.md", "evidence/checkout-rescue.md"];
for (const relative of evidenceFiles) {
  const absolute = path.join(exerciseRoot, relative);
  if (!fs.existsSync(absolute)) {
    failures.push(`missing ${relative}`);
    continue;
  }
  const text = fs.readFileSync(absolute, "utf8").toLowerCase();
  for (const term of relative.includes("mcp") ? ["accessibility snapshot", "network", "tax", "authorization"] : ["root cause", "repeat-each=20", "workers=2", "exit code"]) {
    if (!text.includes(term)) failures.push(`${relative} is missing ${term}`);
  }
}
const trace = path.join(exerciseRoot, "evidence", "trace.zip");
if (!fs.existsSync(trace)) failures.push("missing evidence/trace.zip");
else if (fs.statSync(trace).size >= 10 * 1024 * 1024) failures.push("trace.zip must be below 10 MB");

if (failures.length) {
  console.error("Checkout submission verification failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}
console.log("Checkout submission has resilient tests, MCP investigation evidence, and a bounded trace.");

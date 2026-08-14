import assert from "node:assert/strict";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import lighthouse from "lighthouse";
import { verifyLighthouseConfig } from "./quality-verification.mjs";

function argument(name) {
  const index = process.argv.indexOf(name);
  if (index === -1 || !process.argv[index + 1]) throw new Error(`Missing ${name}`);
  return process.argv[index + 1];
}

function runNode(argumentsList, label) {
  const result = spawnSync(process.execPath, argumentsList, { cwd: process.cwd(), encoding: "utf8" });
  if (result.status !== 0) throw new Error(`${label} failed:\n${result.stderr || result.stdout}`);
}

async function waitFor(url) {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    try { if ((await fetch(url)).ok) return; }
    catch { /* endpoint is still starting */ }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Endpoint did not become ready at ${url}`);
}

async function availablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
  });
}

const sourceSha = argument("--sha");
assert.match(sourceSha, /^[a-f0-9]{40}$/, "--sha must be a full Git SHA");
const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const evidenceRoot = path.join(exerciseRoot, "evidence");
const lighthouseOutput = path.join(evidenceRoot, "raw", "lighthouse");
const axeOutput = path.join(evidenceRoot, "raw", "axe.json");
const summaryOutput = path.join(evidenceRoot, "quality-summary.json");
const comparisonOutput = path.join(evidenceRoot, "comparison.md");
for (const target of [lighthouseOutput, axeOutput, summaryOutput, comparisonOutput]) assert.ok(!fs.existsSync(target), `refusing to overwrite existing evidence: ${target}`);
const contract = JSON.parse(fs.readFileSync(path.join(exerciseRoot, "fixtures", "quality-thresholds.json"), "utf8"));
const lighthouseConfig = JSON.parse(fs.readFileSync(path.join(appRoot, "lighthouserc.json"), "utf8"));
assert.deepEqual(verifyLighthouseConfig(lighthouseConfig, contract), [], "lighthouserc.json does not meet the protected contract");

const previewUrl = "http://127.0.0.1:4173/";
const viteCli = path.join(appRoot, "node_modules", "vite", "bin", "vite.js");
const server = spawn(process.execPath, [viteCli, "preview", "--host", "127.0.0.1", "--port", "4173", "--strictPort"], { cwd: appRoot, stdio: "ignore" });
const channel = process.env.QUALITY_GATE_BROWSER_CHANNEL ?? "chrome";
try {
  await waitFor(previewUrl);
  fs.mkdirSync(lighthouseOutput, { recursive: true });
  for (let run = 1; run <= contract.lighthouseRuns; run += 1) {
    const debuggingPort = await availablePort();
    const browser = await chromium.launch({ channel, headless: true, args: [`--remote-debugging-port=${debuggingPort}`] });
    try {
      await waitFor(`http://127.0.0.1:${debuggingPort}/json/version`);
      const result = await lighthouse(previewUrl, {
        port: debuggingPort,
        output: "json",
        logLevel: "error",
        onlyCategories: lighthouseConfig.ci.collect.settings.onlyCategories,
      });
      assert.ok(result?.lhr, `Lighthouse run ${run} did not produce a report`);
      fs.writeFileSync(path.join(lighthouseOutput, `run-${run}.json`), `${JSON.stringify(result.lhr, null, 2)}\n`);
      console.log(`PASS captured Lighthouse run ${run}`);
    } finally { await browser.close(); }
  }

  const browser = await chromium.launch({ channel, headless: true });
  try {
    const context = await browser.newContext();
    try {
      const page = await context.newPage();
      await page.goto(previewUrl, { waitUntil: "networkidle" });
      await page.locator("h1").waitFor({ state: "visible" });
      const results = await new AxeBuilder({ page }).analyze();
      const document = {
        schemaVersion: 1,
        sourceSha,
        testedUrl: page.url(),
        route: new URL(page.url()).pathname,
        generatedAt: new Date().toISOString(),
        browser: { name: channel, version: browser.version() },
        violations: results.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          help: violation.help,
          nodes: violation.nodes.map((node) => ({ target: node.target, html: node.html, failureSummary: node.failureSummary })),
        })),
      };
      fs.mkdirSync(path.dirname(axeOutput), { recursive: true });
      fs.writeFileSync(axeOutput, `${JSON.stringify(document, null, 2)}\n`);
    } finally { await context.close(); }
  } finally { await browser.close(); }
} finally {
  server.kill();
}

const gateScript = path.join(appRoot, "scripts", "quality-gate.mjs");
assert.ok(fs.existsSync(gateScript), "missing scripts/quality-gate.mjs");
runNode([
  gateScript,
  "--lighthouse-dir", lighthouseOutput,
  "--axe", axeOutput,
  "--contract", path.join(exerciseRoot, "fixtures", "quality-thresholds.json"),
  "--sha", sourceSha,
  "--output", summaryOutput,
], "quality gate");
runNode([
  path.join(appRoot, "scripts", "write-quality-comparison.mjs"),
  "--summary", summaryOutput,
  "--output", comparisonOutput,
], "comparison generation");
console.log(`Source SHA: ${sourceSha}`);
console.log("PASS captured three Lighthouse reports from one production build");
console.log("PASS captured axe evidence from the same route and Chrome major");
console.log("PASS generated quality summary and reviewer comparison");

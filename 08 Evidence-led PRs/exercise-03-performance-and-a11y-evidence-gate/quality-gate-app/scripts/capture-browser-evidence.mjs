import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import lighthouse from "lighthouse";
import { prepareCaptureDestination, sha256File, sha256Tree, verifyLighthouseConfig } from "./quality-verification.mjs";

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
const finalRaw = path.join(evidenceRoot, "raw");
const finalManifest = path.join(evidenceRoot, "capture-manifest.json");
const finalSummary = path.join(evidenceRoot, "quality-summary.json");
const finalComparison = path.join(evidenceRoot, "comparison.md");
const finalMarker = path.join(evidenceRoot, "capture-complete.json");
prepareCaptureDestination(evidenceRoot);

const contractPath = path.join(exerciseRoot, "fixtures", "quality-thresholds.json");
const configPath = path.join(appRoot, "lighthouserc.json");
const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));
const lighthouseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
assert.deepEqual(verifyLighthouseConfig(lighthouseConfig, contract), [], "lighthouserc.json does not meet the protected contract");
const collect = lighthouseConfig.ci.collect;
const configuredUrl = new URL(collect.url[0]);
const staging = fs.mkdtempSync(path.join(os.tmpdir(), "quality-capture-"));
const productionBuild = path.join(staging, "production-build");
const lighthouseOutput = path.join(staging, "raw", "lighthouse");
const axeOutput = path.join(staging, "raw", "axe.json");
const summaryOutput = path.join(staging, "quality-summary.json");
const comparisonOutput = path.join(staging, "comparison.md");
const captureManifest = path.join(staging, "capture-manifest.json");
const completionMarker = path.join(staging, "capture-complete.json");
const port = await availablePort();
const previewUrl = `http://127.0.0.1:${port}${configuredUrl.pathname}`;
const viteCli = path.join(appRoot, "node_modules", "vite", "bin", "vite.js");
runNode([viteCli, "build", "--outDir", productionBuild, "--emptyOutDir"], "production build");
const server = spawn(process.execPath, [viteCli, "preview", "--outDir", productionBuild, "--host", "127.0.0.1", "--port", String(port), "--strictPort"], { cwd: appRoot, stdio: "ignore" });
const channel = process.env.QUALITY_GATE_BROWSER_CHANNEL ?? "chrome";
let browserVersion = "";
try {
  await waitFor(previewUrl);
  fs.mkdirSync(lighthouseOutput, { recursive: true });
  for (let run = 1; run <= collect.numberOfRuns; run += 1) {
    const debuggingPort = await availablePort();
    const browser = await chromium.launch({ channel, headless: true, args: [`--remote-debugging-port=${debuggingPort}`] });
    try {
      browserVersion = browser.version();
      await waitFor(`http://127.0.0.1:${debuggingPort}/json/version`);
      const result = await lighthouse(
        previewUrl,
        { port: debuggingPort, output: "json", logLevel: "error" },
        { extends: "lighthouse:default", settings: collect.settings },
      );
      assert.ok(result?.lhr, `Lighthouse run ${run} did not produce a report`);
      fs.writeFileSync(path.join(lighthouseOutput, `run-${run}.json`), `${JSON.stringify(result.lhr, null, 2)}\n`);
      console.log(`PASS captured Lighthouse run ${run}`);
    } finally { await browser.close(); }
  }

  const browser = await chromium.launch({ channel, headless: true });
  try {
    assert.equal(browser.version().split(".")[0], browserVersion.split(".")[0], "axe and Lighthouse must use the same browser major");
    const screen = contract.captureEnvironment.screenEmulation;
    const context = await browser.newContext({
      viewport: { width: screen.width, height: screen.height },
      deviceScaleFactor: screen.deviceScaleFactor,
      isMobile: screen.mobile,
    });
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
        captureEnvironment: contract.captureEnvironment,
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

  const lighthouseReports = fs.readdirSync(lighthouseOutput).sort().map((file) => ({
    path: `raw/lighthouse/${file}`,
    sha256: sha256File(path.join(lighthouseOutput, file)),
  }));
  const manifest = {
    schemaVersion: 1,
    sourceSha,
    captureSession: crypto.randomUUID(),
    capturedAt: new Date().toISOString(),
    configSha256: sha256File(configPath),
    productionBuildSha256: sha256Tree(productionBuild),
    route: configuredUrl.pathname,
    numberOfRuns: collect.numberOfRuns,
    browser: { channel, version: browserVersion },
    captureEnvironment: contract.captureEnvironment,
    lighthouseReports,
    axeReport: { path: "raw/axe.json", sha256: sha256File(axeOutput) },
  };
  fs.writeFileSync(captureManifest, `${JSON.stringify(manifest, null, 2)}\n`);
  fs.writeFileSync(completionMarker, `${JSON.stringify({
    schemaVersion: 1,
    sourceSha,
    captureSession: manifest.captureSession,
    manifestSha256: sha256File(captureManifest),
    completedAt: new Date().toISOString(),
  }, null, 2)}\n`);

  const gateScript = path.join(appRoot, "scripts", "quality-gate.mjs");
  assert.ok(fs.existsSync(gateScript), "missing scripts/quality-gate.mjs");
  runNode([gateScript, "--lighthouse-dir", lighthouseOutput, "--axe", axeOutput, "--contract", contractPath, "--sha", sourceSha, "--output", summaryOutput], "quality gate");
  runNode([path.join(appRoot, "scripts", "write-quality-comparison.mjs"), "--summary", summaryOutput, "--output", comparisonOutput], "comparison generation");

  fs.mkdirSync(evidenceRoot, { recursive: true });
  fs.renameSync(path.join(staging, "raw"), finalRaw);
  fs.renameSync(captureManifest, finalManifest);
  fs.renameSync(summaryOutput, finalSummary);
  fs.renameSync(comparisonOutput, finalComparison);
  fs.renameSync(completionMarker, finalMarker);
  console.log(`Source SHA: ${sourceSha}`);
  console.log(`PASS captured ${collect.numberOfRuns} Lighthouse reports using lighthouserc.json from one production build`);
  console.log("PASS published raw evidence and capture manifest only after every stage succeeded");
} finally {
  server.kill();
  fs.rmSync(staging, { recursive: true, force: true });
}

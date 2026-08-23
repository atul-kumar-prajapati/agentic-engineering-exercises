import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import os from "node:os";
import { isDeepStrictEqual } from "node:util";

const CAPTURE_TARGETS = ["raw", "capture-manifest.json", "quality-summary.json", "comparison.md"];

export function prepareCaptureDestination(evidenceRoot) {
  const completionMarker = path.join(evidenceRoot, "capture-complete.json");
  if (fs.existsSync(completionMarker)) throw new Error(`refusing to overwrite completed evidence: ${completionMarker}`);
  const removed = [];
  for (const relative of CAPTURE_TARGETS) {
    const target = path.join(evidenceRoot, relative);
    if (!fs.existsSync(target)) continue;
    fs.rmSync(target, { recursive: true, force: true });
    removed.push(relative);
  }
  return removed;
}

export function sha256File(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

export function sha256Tree(directory) {
  const hash = crypto.createHash("sha256");
  const visit = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
      const absolute = path.join(current, entry.name);
      const relative = path.relative(directory, absolute).split(path.sep).join("/");
      if (entry.isDirectory()) visit(absolute);
      else if (entry.isFile()) {
        hash.update(`${relative}\0`);
        hash.update(fs.readFileSync(absolute));
        hash.update("\0");
      }
    }
  };
  visit(directory);
  return hash.digest("hex");
}

export function verifyCaptureManifest({ manifest, sourceSha, configPath, productionBuild, evidenceRoot, contract, completionMarker }) {
  const failures = [];
  if (manifest?.schemaVersion !== 1 || manifest?.sourceSha !== sourceSha) failures.push("capture manifest identity or source SHA is incorrect");
  if (!/^[0-9a-f-]{36}$/.test(manifest?.captureSession ?? "")) failures.push("capture manifest session ID is invalid");
  if (typeof manifest?.capturedAt !== "string" || Number.isNaN(Date.parse(manifest.capturedAt))) failures.push("capture manifest time is invalid");
  if (manifest?.configSha256 !== sha256File(configPath)) failures.push("capture manifest does not match lighthouserc.json");
  if (manifest?.productionBuildSha256 !== sha256Tree(productionBuild)) failures.push("capture manifest does not match the current production build");
  if (manifest?.route !== contract.route || manifest?.numberOfRuns !== contract.lighthouseRuns) failures.push("capture manifest route or run count differs from the protected contract");
  if (!manifest?.browser?.channel || !manifest?.browser?.version) failures.push("capture manifest browser is missing");
  if (!isDeepStrictEqual(manifest?.captureEnvironment, contract.captureEnvironment)) failures.push("capture manifest does not bind the protected browser and screen settings");
  const expectedReports = Array.from({ length: contract.lighthouseRuns }, (_, index) => `raw/lighthouse/run-${index + 1}.json`);
  const manifestReports = Array.isArray(manifest?.lighthouseReports) ? manifest.lighthouseReports.map((report) => report?.path) : [];
  if (!isDeepStrictEqual(manifestReports, expectedReports)) failures.push("capture manifest must bind each Lighthouse report exactly once in run order");
  if (!Array.isArray(manifest?.lighthouseReports) || manifest.lighthouseReports.length !== contract.lighthouseRuns) failures.push("capture manifest must bind every Lighthouse report");
  else for (const report of manifest.lighthouseReports) {
    const absolute = path.resolve(evidenceRoot, report.path ?? "");
    if (!absolute.startsWith(`${path.resolve(evidenceRoot)}${path.sep}`) || !fs.existsSync(absolute)) failures.push(`capture manifest report is missing: ${report.path}`);
    else {
      if (report.sha256 !== sha256File(absolute)) failures.push(`capture manifest report digest differs: ${report.path}`);
      try {
        const lighthouse = JSON.parse(fs.readFileSync(absolute, "utf8"));
        if (browserMajor(lighthouse?.environment?.networkUserAgent) !== String(manifest?.browser?.version ?? "").split(".")[0]) failures.push(`capture manifest browser differs from ${report.path}`);
      } catch { failures.push(`capture manifest report is invalid JSON: ${report.path}`); }
    }
  }
  const axePath = path.resolve(evidenceRoot, manifest?.axeReport?.path ?? "");
  if (!axePath.startsWith(`${path.resolve(evidenceRoot)}${path.sep}`) || !fs.existsSync(axePath)) failures.push("capture manifest axe report is missing");
  else {
    if (manifest?.axeReport?.path !== "raw/axe.json" || manifest?.axeReport?.sha256 !== sha256File(axePath)) failures.push("capture manifest axe digest or path differs");
    try {
      const axe = JSON.parse(fs.readFileSync(axePath, "utf8"));
      if (axe?.browser?.name !== manifest?.browser?.channel || axe?.browser?.version !== manifest?.browser?.version) failures.push("capture manifest browser differs from axe evidence");
      if (!isDeepStrictEqual(axe?.captureEnvironment, manifest?.captureEnvironment)) failures.push("capture manifest device differs from axe evidence");
    } catch { failures.push("capture manifest axe report is invalid JSON"); }
  }
  if (
    !completionMarker
    || completionMarker.schemaVersion !== 1
    || completionMarker.sourceSha !== sourceSha
    || completionMarker.captureSession !== manifest?.captureSession
    || completionMarker.manifestSha256 !== sha256File(path.join(evidenceRoot, "capture-manifest.json"))
    || typeof completionMarker.completedAt !== "string"
    || Number.isNaN(Date.parse(completionMarker.completedAt))
  ) failures.push("capture completion marker does not bind the source SHA and published manifest");
  return failures;
}

function browserMajor(userAgent) {
  return String(userAgent ?? "").match(/(?:Chrome|Chromium)\/(\d+)/)?.[1] ?? null;
}

export function readLighthouseReports(directory, contract) {
  const failures = [];
  if (!fs.existsSync(directory)) return { failures: ["missing raw Lighthouse directory"], runs: [] };
  const files = fs.readdirSync(directory).filter((file) => /^run-[1-3]\.json$/.test(file)).sort();
  if (files.length !== contract.lighthouseRuns) failures.push(`expected ${contract.lighthouseRuns} raw Lighthouse reports`);
  const runs = [];
  for (const file of files) {
    const absolute = path.join(directory, file);
    let report;
    try { report = JSON.parse(fs.readFileSync(absolute, "utf8")); }
    catch { failures.push(`${file} is invalid JSON`); continue; }
    const performance = report?.categories?.performance?.score;
    const accessibility = report?.categories?.accessibility?.score;
    const largestContentfulPaintMs = report?.audits?.["largest-contentful-paint"]?.numericValue;
    let route = null;
    try { route = new URL(report.finalUrl).pathname; }
    catch { failures.push(`${file} finalUrl is invalid`); }
    const environment = {
      hostUserAgent: report?.environment?.hostUserAgent,
      networkUserAgent: report?.environment?.networkUserAgent,
      browserMajor: browserMajor(report?.environment?.networkUserAgent),
      formFactor: report?.configSettings?.formFactor,
      throttlingMethod: report?.configSettings?.throttlingMethod,
      screenEmulation: report?.configSettings?.screenEmulation,
    };
    if (typeof report?.lighthouseVersion !== "string" || !report.lighthouseVersion) failures.push(`${file} is not a raw Lighthouse report`);
    if (typeof report?.fetchTime !== "string" || Number.isNaN(Date.parse(report.fetchTime))) failures.push(`${file} fetchTime is invalid`);
    if (![performance, accessibility].every((value) => typeof value === "number") || typeof largestContentfulPaintMs !== "number") failures.push(`${file} is missing required metrics`);
    if (route !== contract.route) failures.push(`${file} audited route ${route ?? "unknown"} instead of ${contract.route}`);
    if (!environment.hostUserAgent || !environment.networkUserAgent || !environment.browserMajor || !environment.formFactor || !environment.throttlingMethod) failures.push(`${file} environment is incomplete`);
    if (!isDeepStrictEqual({ formFactor: environment.formFactor, throttlingMethod: environment.throttlingMethod, screenEmulation: environment.screenEmulation }, contract.captureEnvironment)) failures.push(`${file} did not use the protected browser and screen settings`);
    if (report?.runtimeError) failures.push(`${file} contains a Lighthouse runtime error`);
    runs.push({
      file,
      sha256: sha256File(absolute),
      fetchTime: report?.fetchTime,
      lighthouseVersion: report?.lighthouseVersion,
      finalUrl: report?.finalUrl,
      route,
      environment,
      performance,
      accessibility,
      largestContentfulPaintMs,
    });
  }
  if (runs.length === contract.lighthouseRuns) {
    const signature = JSON.stringify(runs[0].environment);
    if (runs.some((run) => JSON.stringify(run.environment) !== signature)) failures.push("Lighthouse runs use different browser environments");
  }
  return { failures, runs };
}

export function readAxeEvidence(file, sourceSha, contract, lighthouseBrowserMajor) {
  const failures = [];
  if (!fs.existsSync(file)) return { failures: ["missing raw axe evidence"], axe: null };
  let document;
  try { document = JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { return { failures: ["raw axe evidence is invalid JSON"], axe: null }; }
  if (document.schemaVersion !== 1 || document.sourceSha !== sourceSha) failures.push("axe evidence identity or source SHA is incorrect");
  if (document.route !== contract.route) failures.push("axe evidence tested the wrong route");
  if (typeof document.testedUrl !== "string" || typeof document.generatedAt !== "string" || Number.isNaN(Date.parse(document.generatedAt))) failures.push("axe URL or capture time is invalid");
  if (!Array.isArray(document.violations)) failures.push("axe violations must be an array");
  if (!document.browser?.name || !document.browser?.version) failures.push("axe browser environment is missing");
  if (!isDeepStrictEqual(document.captureEnvironment, contract.captureEnvironment)) failures.push("axe evidence did not use the protected browser and screen settings");
  const axeBrowserMajor = String(document.browser?.version ?? "").split(".")[0];
  if (lighthouseBrowserMajor && axeBrowserMajor !== lighthouseBrowserMajor) failures.push("axe and Lighthouse use different Chrome major versions");
  return {
    failures,
    axe: {
      file: "axe.json",
      sha256: sha256File(file),
      testedUrl: document.testedUrl,
      route: document.route,
      generatedAt: document.generatedAt,
      browser: document.browser,
      captureEnvironment: document.captureEnvironment,
      violations: document.violations,
    },
  };
}

export function expectedSummary({ sourceSha, contract, runs, axe }) {
  const worstCase = {
    performance: Math.min(...runs.map((run) => run.performance)),
    accessibility: Math.min(...runs.map((run) => run.accessibility)),
    largestContentfulPaintMs: Math.max(...runs.map((run) => run.largestContentfulPaintMs)),
    axeViolations: axe.violations.length,
  };
  const failures = [];
  if (worstCase.performance < contract.thresholds.minimumPerformance) failures.push("performance below minimum");
  if (worstCase.accessibility < contract.thresholds.minimumAccessibility) failures.push("accessibility below minimum");
  if (worstCase.largestContentfulPaintMs > contract.thresholds.maximumLargestContentfulPaintMs) failures.push("largest contentful paint above maximum");
  if (worstCase.axeViolations > contract.thresholds.maximumAxeViolations) failures.push("axe violations above maximum");
  return {
    schemaVersion: 1,
    sourceSha,
    route: contract.route,
    aggregation: contract.aggregation,
    thresholds: contract.thresholds,
    lighthouseRuns: runs,
    axe,
    worstCase,
    failures,
    releaseDecision: failures.length === 0 ? "passed" : "failed",
  };
}

export function verifyLighthouseConfig(config, contract) {
  const failures = [];
  const collect = config?.ci?.collect;
  const assertions = config?.ci?.assert?.assertions;
  if (collect?.staticDistDir !== "./dist") failures.push("Lighthouse must audit ./dist");
  if (!isDeepStrictEqual(collect?.url, ["http://localhost/"])) failures.push("Lighthouse must audit only http://localhost/");
  if (collect?.numberOfRuns !== contract.lighthouseRuns) failures.push(`Lighthouse must run exactly ${contract.lighthouseRuns} times`);
  if (!isDeepStrictEqual([...(collect?.settings?.onlyCategories ?? [])].sort(), ["accessibility", "performance"])) failures.push("Lighthouse must collect performance and accessibility categories");
  if (!isDeepStrictEqual({ formFactor: collect?.settings?.formFactor, throttlingMethod: collect?.settings?.throttlingMethod, screenEmulation: collect?.settings?.screenEmulation }, contract.captureEnvironment)) failures.push("Lighthouse must use the protected mobile browser and screen settings");
  if (collect?.settings?.skipAudits?.length) failures.push("Lighthouse audits must not be skipped");
  const expected = {
    "categories:performance": contract.thresholds.minimumPerformance,
    "categories:accessibility": contract.thresholds.minimumAccessibility,
    "largest-contentful-paint": contract.thresholds.maximumLargestContentfulPaintMs,
  };
  for (const [name, threshold] of Object.entries(expected)) {
    const assertion = assertions?.[name];
    const optionName = name === "largest-contentful-paint" ? "maxNumericValue" : "minScore";
    if (!Array.isArray(assertion) || assertion[0] !== "error" || assertion[1]?.[optionName] !== threshold || assertion[1]?.aggregationMethod !== "pessimistic") failures.push(`${name} must be an error with the protected threshold and pessimistic aggregation`);
  }
  return failures;
}

export function verifySummary(actual, expected) {
  return isDeepStrictEqual(actual, expected) ? [] : ["quality-summary.json does not match the raw evidence and protected thresholds"];
}

export function renderComparison(summary, baselineLighthouse, baselineAxe) {
  const after = summary.worstCase;
  const environment = summary.lighthouseRuns[0].environment;
  const artifactRows = summary.lighthouseRuns.map((run) => `| ${run.file} | ${run.sha256} | ${run.performance.toFixed(2)} | ${run.accessibility.toFixed(2)} | ${Math.round(run.largestContentfulPaintMs)} ms |`).join("\n");
  return `# Performance and Accessibility Evidence\n\nSource SHA: ${summary.sourceSha}\n\nRoute: ${summary.route}\n\nRelease decision: ${summary.releaseDecision.toUpperCase()}\n\n## Before and after\n\nSame conditions were used for the Before and After runs. The raw reports below are the Proof for the release decision.\n\n| Metric | Protected baseline | After, pessimistic | Required |\n| --- | ---: | ---: | ---: |\n| Performance | ${baselineLighthouse.worstCase.performance.toFixed(2)} | ${after.performance.toFixed(2)} | >= ${summary.thresholds.minimumPerformance.toFixed(2)} |\n| Accessibility | ${baselineLighthouse.worstCase.accessibility.toFixed(2)} | ${after.accessibility.toFixed(2)} | = ${summary.thresholds.minimumAccessibility.toFixed(2)} |\n| LCP | ${baselineLighthouse.worstCase.largestContentfulPaintMs} ms | ${Math.round(after.largestContentfulPaintMs)} ms | <= ${summary.thresholds.maximumLargestContentfulPaintMs} ms |\n| Axe violations | ${baselineAxe.violations.length} | ${after.axeViolations} | = ${summary.thresholds.maximumAxeViolations} |\n\n## Comparable environment\n\n- Lighthouse runs: ${summary.lighthouseRuns.length}\n- Aggregation: ${summary.aggregation}\n- Chrome major: ${environment.browserMajor}\n- Form factor: ${environment.formFactor}\n- Throttling: ${environment.throttlingMethod}\n- Axe browser: ${summary.axe.browser.name} ${summary.axe.browser.version}\n- Production route: ${summary.route}\n\n## Raw artifact trace\n\n| Artifact | SHA-256 | Performance | Accessibility | LCP |\n| --- | --- | ---: | ---: | ---: |\n${artifactRows}\n\nAxe artifact SHA-256: ${summary.axe.sha256}\n\n## Failure-path proof\n\nThe protected verifier changes one Lighthouse run below the performance threshold and injects one axe violation. The submitted gate must write a failed decision and return non-zero for both cases.\n\n## Residual risk\n\nLighthouse results can vary across hardware even with pessimistic aggregation. Automated axe checks do not replace keyboard, screen-reader, zoom, or usability review. Re-run this gate in the review environment and complete focused manual accessibility checks before release.\n\n## Conclusion\n\nThe After run passes the protected pessimistic gate; the Before baseline does not.\n`;
}

function git(root, args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

export function verifyGitBinding({ repositoryRoot, exerciseRoot, sourceSha }) {
  const failures = [];
  try {
    const head = git(repositoryRoot, ["rev-parse", "HEAD"]);
    git(repositoryRoot, ["merge-base", "--is-ancestor", sourceSha, head]);
    const prefix = path.relative(repositoryRoot, exerciseRoot).split(path.sep).join("/");
    for (const relative of ["quality-gate-app/src/main.tsx", "quality-gate-app/src/App.tsx", "quality-gate-app/lighthouserc.json", "quality-gate-app/scripts/quality-gate.mjs"]) git(repositoryRoot, ["show", `${sourceSha}:${prefix}/${relative}`]);
    const changed = git(repositoryRoot, ["diff", "--name-only", sourceSha]).split(/\r?\n/).filter(Boolean);
    for (const file of changed) if (!file.startsWith(`${prefix}/evidence/`)) failures.push(`commit after sourceSha changes non-evidence file ${file}`);
  } catch { failures.push("sourceSha must be an ancestor containing the UI fix and gate implementation"); }
  return failures;
}

function invokeGate({ appRoot, lighthouseDir, axePath, contractPath, sourceSha, outputPath }) {
  return spawnSync(process.execPath, [
    path.join(appRoot, "scripts", "quality-gate.mjs"),
    "--lighthouse-dir", lighthouseDir,
    "--axe", axePath,
    "--contract", contractPath,
    "--sha", sourceSha,
    "--output", outputPath,
  ], { cwd: appRoot, encoding: "utf8" });
}

export function verifyGateControls({ appRoot, lighthouseDir, axePath, contractPath, sourceSha, expected }) {
  const failures = [];
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "quality-gate-controls-"));
  try {
    const positiveOutput = path.join(temporary, "positive.json");
    const positive = invokeGate({ appRoot, lighthouseDir, axePath, contractPath, sourceSha, outputPath: positiveOutput });
    if (positive.status !== 0 || !fs.existsSync(positiveOutput)) failures.push(`quality gate could not reproduce passing evidence: ${positive.stderr || positive.stdout}`);
    else {
      const document = JSON.parse(fs.readFileSync(positiveOutput, "utf8"));
      failures.push(...verifySummary(document, expected));
    }

    const failingLighthouse = path.join(temporary, "lighthouse-fail");
    fs.mkdirSync(failingLighthouse);
    for (const file of fs.readdirSync(lighthouseDir)) fs.copyFileSync(path.join(lighthouseDir, file), path.join(failingLighthouse, file));
    const firstPath = path.join(failingLighthouse, "run-1.json");
    const first = JSON.parse(fs.readFileSync(firstPath, "utf8"));
    first.categories.performance.score = 0.89;
    fs.writeFileSync(firstPath, `${JSON.stringify(first, null, 2)}\n`);
    const performanceOutput = path.join(temporary, "performance-fail.json");
    const performance = invokeGate({ appRoot, lighthouseDir: failingLighthouse, axePath, contractPath, sourceSha, outputPath: performanceOutput });
    if (performance.status === 0 || !fs.existsSync(performanceOutput)) failures.push("quality gate did not return non-zero for one failing Lighthouse run");
    else {
      const document = JSON.parse(fs.readFileSync(performanceOutput, "utf8"));
      if (document.releaseDecision !== "failed" || !document.failures?.includes("performance below minimum")) failures.push("performance negative control did not write the expected failed decision");
    }

    const failingAxe = path.join(temporary, "axe-fail.json");
    const axe = JSON.parse(fs.readFileSync(axePath, "utf8"));
    axe.violations.push({ id: "button-name", impact: "critical", nodes: [{ target: ["button"] }] });
    fs.writeFileSync(failingAxe, `${JSON.stringify(axe, null, 2)}\n`);
    const accessibilityOutput = path.join(temporary, "accessibility-fail.json");
    const accessibility = invokeGate({ appRoot, lighthouseDir, axePath: failingAxe, contractPath, sourceSha, outputPath: accessibilityOutput });
    if (accessibility.status === 0 || !fs.existsSync(accessibilityOutput)) failures.push("quality gate did not return non-zero for an axe violation");
    else {
      const document = JSON.parse(fs.readFileSync(accessibilityOutput, "utf8"));
      if (document.releaseDecision !== "failed" || !document.failures?.includes("axe violations above maximum")) failures.push("axe negative control did not write the expected failed decision");
    }
  } catch (error) { failures.push(`quality gate control verification failed: ${error.message}`); }
  finally { fs.rmSync(temporary, { recursive: true, force: true }); }
  return failures;
}

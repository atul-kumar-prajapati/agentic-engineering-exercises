import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const USAGE = "usage: node scripts/generate-pr-evidence.mjs --fixture <fixture.json> --sha <40-hex-sha> --output <dir>";

function parseArgs(argv) {
  const args = { fixture: undefined, sha: undefined, output: undefined };
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const name = flag?.startsWith("--") ? flag.slice(2) : null;
    const value = argv[index + 1];
    if (name === null || !(name in args) || value === undefined) return null;
    args[name] = value;
  }
  return Object.values(args).every((value) => typeof value === "string" && value.length > 0) ? args : null;
}

function inside(root, candidate) {
  const absolute = path.resolve(root, candidate);
  return absolute === root || absolute.startsWith(`${root}${path.sep}`) ? absolute : null;
}

function validateFixture(fixture, fixtureRoot) {
  const errors = [];
  if (fixture?.schemaVersion !== 1) errors.push("fixture must use schemaVersion 1");
  if (!Array.isArray(fixture?.checks) || fixture.checks.length === 0) {
    errors.push("fixture must contain at least one check");
    return errors;
  }
  const filenames = new Set();
  fixture.checks.forEach((check, index) => {
    const label = `check ${index + 1}`;
    for (const field of ["name", "command", "result", "outputPath", "risk", "reviewerAction", "rollback"]) {
      if (typeof check[field] !== "string" || !check[field].trim()) errors.push(`${label} is missing ${field}`);
    }
    if (!Number.isInteger(check.exitCode) || check.exitCode < 0) errors.push(`${label} has an invalid exitCode`);
    if (!["passed", "failed"].includes(check.result) || (check.result === "passed") !== (check.exitCode === 0)) {
      errors.push(`${label} result and exitCode disagree`);
    }
    if (typeof check.outputPath === "string" && check.outputPath.trim()) {
      const source = inside(fixtureRoot, check.outputPath);
      if (!source || !fs.existsSync(source) || !fs.statSync(source).isFile()) {
        errors.push(`${label} artifact is missing or escapes the fixture directory`);
      }
      const filename = path.basename(check.outputPath);
      if (filenames.has(filename)) errors.push(`duplicate artifact filename ${filename}`);
      filenames.add(filename);
    }
  });
  return errors;
}

function summarize(checks) {
  const firstFailure = checks.find((check) => check.exitCode !== 0);
  return firstFailure
    ? { overallResult: "failed", overallExitCode: firstFailure.exitCode }
    : { overallResult: "passed", overallExitCode: 0 };
}

function renderSummary(sourceSha, outcome, entries) {
  const lines = [
    "# PR Evidence Pack",
    "",
    `Source SHA: ${sourceSha}`,
    `Overall result: ${outcome.overallResult}`,
    `Overall exit code: ${outcome.overallExitCode}`,
    ""
  ];
  for (const entry of entries) {
    lines.push(
      `## ${entry.name}`,
      "",
      `Result: ${entry.result}`,
      `Exit code: ${entry.exitCode}`,
      `Artifact: ${entry.artifact.path}`,
      `SHA-256: ${entry.artifact.sha256}`,
      `Risk: ${entry.risk}`,
      `Reviewer action: ${entry.reviewerAction}`,
      `Rollback: ${entry.rollback}`,
      ""
    );
  }
  return `${lines.join("\n")}\n`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args) {
    process.stderr.write(`${USAGE}\n`);
    process.exitCode = 2;
    return;
  }
  if (!/^[a-f0-9]{40}$/.test(args.sha)) {
    process.stderr.write(`invalid --sha: expected 40 lowercase hex characters\n`);
    process.exitCode = 2;
    return;
  }
  if (!fs.existsSync(args.fixture) || !fs.statSync(args.fixture).isFile()) {
    process.stderr.write(`fixture not found: ${args.fixture}\n`);
    process.exitCode = 2;
    return;
  }
  const fixtureBytes = fs.readFileSync(args.fixture);
  let fixture;
  try {
    fixture = JSON.parse(fixtureBytes.toString("utf8"));
  } catch {
    process.stderr.write(`fixture is not valid JSON: ${args.fixture}\n`);
    process.exitCode = 2;
    return;
  }
  const fixtureRoot = path.dirname(path.resolve(args.fixture));
  const errors = validateFixture(fixture, fixtureRoot);
  if (errors.length > 0) {
    process.stderr.write(`${errors.join("\n")}\n`);
    process.exitCode = 2;
    return;
  }
  const outcome = summarize(fixture.checks);
  const outputRoot = path.resolve(args.output);
  const artifactRoot = path.join(outputRoot, "artifacts");
  fs.mkdirSync(artifactRoot, { recursive: true });
  const entries = fixture.checks.map((check) => {
    const filename = path.basename(check.outputPath);
    const destination = path.join(artifactRoot, filename);
    fs.copyFileSync(inside(fixtureRoot, check.outputPath), destination);
    const bytes = fs.readFileSync(destination);
    return {
      name: check.name,
      command: check.command,
      exitCode: check.exitCode,
      result: check.result,
      risk: check.risk,
      reviewerAction: check.reviewerAction,
      rollback: check.rollback,
      artifact: {
        path: `artifacts/${filename}`,
        sha256: crypto.createHash("sha256").update(bytes).digest("hex")
      }
    };
  });
  const pack = {
    schemaVersion: 1,
    sourceSha: args.sha,
    fixtureSha256: crypto.createHash("sha256").update(fixtureBytes).digest("hex"),
    overallResult: outcome.overallResult,
    overallExitCode: outcome.overallExitCode,
    checks: entries
  };
  fs.writeFileSync(path.join(outputRoot, "pr-evidence.json"), `${JSON.stringify(pack, null, 2)}\n`);
  fs.writeFileSync(path.join(outputRoot, "summary.md"), renderSummary(args.sha, outcome, entries));
  process.exitCode = outcome.overallExitCode;
}

main();

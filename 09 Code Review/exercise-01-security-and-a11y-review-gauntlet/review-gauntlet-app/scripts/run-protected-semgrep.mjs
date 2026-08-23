import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const evidencePath = path.join(exerciseRoot, "evidence", "semgrep.json");
const writeMode = process.argv.includes("--write");
const requirement = fs.readFileSync(path.join(appRoot, "requirements-semgrep.txt"), "utf8").trim();
const expectedVersion = requirement.match(/^semgrep==([^\s]+)$/)?.[1];
if (!expectedVersion) throw new Error("requirements-semgrep.txt must pin one exact Semgrep version");
if (!writeMode && !fs.existsSync(evidencePath)) throw new Error("missing evidence/semgrep.json; run npm run review:semgrep first");
const submitted = writeMode ? null : JSON.parse(fs.readFileSync(evidencePath, "utf8"));
const manifest = JSON.parse(fs.readFileSync(path.join(exerciseRoot, "fixtures", "manifest.json"), "utf8"));
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "protected-semgrep-"));

function runSemgrep(args, cwd = appRoot) {
  const result = spawnSync("semgrep", args, { cwd, encoding: "utf8", shell: process.platform === "win32" });
  if (result.error?.code === "ENOENT" || /not recognized|not found/i.test(result.stderr ?? "")) {
    throw new Error("Semgrep is not installed. Run npm run review:semgrep:install before scanning.");
  }
  return result;
}

function canonicalResults(document) {
  return (document?.results ?? []).map((result) => ({
    checkId: result.check_id,
    path: String(result.path).replaceAll("\\", "/"),
    start: result.start,
    end: result.end,
    message: result.extra?.message,
    severity: result.extra?.severity,
    lines: result.extra?.lines,
  })).sort((left, right) => `${left.checkId}:${left.path}`.localeCompare(`${right.checkId}:${right.path}`));
}

try {
  const version = runSemgrep(["--version"]);
  if (version.status !== 0 || !version.stdout.includes(expectedVersion)) {
    throw new Error(`Semgrep ${expectedVersion} is required; received ${version.stdout.trim() || version.stderr.trim() || "unknown"}`);
  }
  execFileSync("git", ["clone", "-q", path.join(exerciseRoot, "fixtures", manifest.bundle), temporary]);
  execFileSync("git", ["checkout", "-q", manifest.headSha], { cwd: temporary });
  const scan = runSemgrep(["scan", "--config", path.join(appRoot, "semgrep.yml"), "--json", "src/components"], temporary);
  if (scan.status !== 0) throw new Error(`protected Semgrep scan failed:\n${scan.stderr || scan.stdout}`);
  const reproduced = JSON.parse(scan.stdout);
  if ((reproduced.errors ?? []).length) throw new Error("protected Semgrep scan contains errors");
  if (writeMode) {
    fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
    fs.writeFileSync(evidencePath, `${JSON.stringify(reproduced, null, 2)}\n`);
    console.log(`PASS Semgrep ${expectedVersion} evidence captured from protected head ${manifest.headSha}`);
  } else {
    if ((submitted.errors ?? []).length) throw new Error("submitted Semgrep scan contains errors");
    if (submitted.version !== reproduced.version || JSON.stringify(canonicalResults(reproduced)) !== JSON.stringify(canonicalResults(submitted))) {
      throw new Error("evidence/semgrep.json does not match a fresh scan of the protected review head");
    }
    console.log(`PASS Semgrep ${expectedVersion} result details reproduced from protected head ${manifest.headSha}`);
  }
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}

import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const exerciseRoot = path.resolve(appRoot, "..");
const extractor = path.join(appRoot, ".agents", "skills", "release-notes", "scripts", "extract-release.mjs");
const bundle = path.join(exerciseRoot, "fixtures", "release-history.bundle");

if (!fs.existsSync(extractor)) {
  console.error("Extractor verification failed:\n- missing .agents/skills/release-notes/scripts/extract-release.mjs");
  process.exit(1);
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "release-extractor-check-"));
const fixtureRepo = path.join(tempRoot, "fixture");
const syntheticRepo = path.join(tempRoot, "synthetic");

const git = (repo, ...args) => execFileSync("git", ["-C", repo, ...args], { encoding: "utf8" }).trim();

function expectedFor(repo, base, head) {
  const separator = "\u001f";
  const records = git(repo, "log", "--reverse", `--format=%H${separator}%s`, `${base}..${head}`)
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const [sha, subject] = line.split(separator);
      const files = git(repo, "diff-tree", "--no-commit-id", "--name-only", "-r", sha)
        .split(/\r?\n/)
        .filter(Boolean)
        .sort();
      return { sha, subject, files };
    });
  const changedFiles = git(repo, "diff", "--name-only", `${base}..${head}`)
    .split(/\r?\n/)
    .filter(Boolean)
    .sort();
  return { range: { base, head }, commits: records, changedFiles };
}

function runExtractor(repo, base, head) {
  const stdout = execFileSync(process.execPath, [extractor, "--repo", repo, "--base", base, "--head", head], {
    encoding: "utf8",
  });
  try {
    return JSON.parse(stdout);
  } catch {
    throw new Error("extract-release.mjs must print one JSON document to stdout");
  }
}

function compare(actual, expected, label) {
  if (JSON.stringify(actual.range) !== JSON.stringify(expected.range)) throw new Error(`${label}: range is incorrect`);
  if (JSON.stringify(actual.changedFiles) !== JSON.stringify(expected.changedFiles)) throw new Error(`${label}: changedFiles are incorrect or unsorted`);
  if (JSON.stringify(actual.commits) !== JSON.stringify(expected.commits)) throw new Error(`${label}: commits, subjects, or per-commit files are incorrect`);
}

try {
  const source = fs.readFileSync(extractor, "utf8");
  for (const fixtureLiteral of ["d3b56d0", "1c43101", "checkout.js", "billing-export.js", "telemetry.js"]) {
    if (source.includes(fixtureLiteral)) throw new Error(`Extractor contains fixture-specific answer: ${fixtureLiteral}`);
  }

  execFileSync("git", ["clone", "--quiet", bundle, fixtureRepo]);
  for (const [label, base, head] of [
    ["full release", "exercise-base", "origin/exercise-head"],
    ["hotfix only", "exercise-base", "hotfix-head"],
    ["internal only", "breaking-head", "origin/exercise-head"],
  ]) {
    compare(runExtractor(fixtureRepo, base, head), expectedFor(fixtureRepo, base, head), label);
  }

  fs.mkdirSync(syntheticRepo);
  git(syntheticRepo, "init", "-q", "-b", "main");
  git(syntheticRepo, "config", "user.email", "exercise@example.com");
  git(syntheticRepo, "config", "user.name", "Exercise Fixture");
  git(syntheticRepo, "config", "core.autocrlf", "false");
  fs.mkdirSync(path.join(syntheticRepo, "odd path"));
  fs.writeFileSync(path.join(syntheticRepo, "odd path", "alpha file.txt"), "alpha\n");
  git(syntheticRepo, "add", ".");
  git(syntheticRepo, "commit", "-q", "-m", "baseline with spaces");
  git(syntheticRepo, "tag", "synthetic-base");
  fs.writeFileSync(path.join(syntheticRepo, "odd path", "alpha file.txt"), "alpha\nbeta\n");
  fs.writeFileSync(path.join(syntheticRepo, "unicode-release.txt"), "release\n");
  git(syntheticRepo, "add", ".");
  git(syntheticRepo, "commit", "-q", "-m", "feat: synthetic customer behavior");
  compare(runExtractor(syntheticRepo, "synthetic-base", "HEAD"), expectedFor(syntheticRepo, "synthetic-base", "HEAD"), "synthetic repository");

  const invalid = spawnSync(process.execPath, [extractor, "--repo", syntheticRepo, "--base", "missing-ref", "--head", "HEAD"], {
    encoding: "utf8",
  });
  if (invalid.status === 0) throw new Error("Extractor must return non-zero for an invalid ref");
  if (!/ref|range|revision|unknown|invalid/i.test(`${invalid.stdout}\n${invalid.stderr}`)) {
    throw new Error("Extractor must explain an invalid ref or range");
  }

  console.log("Release extractor matches Git for three fixture ranges and an unrelated synthetic repository.");
} finally {
  const resolved = path.resolve(tempRoot);
  const tempBase = path.resolve(os.tmpdir()) + path.sep;
  if (resolved.startsWith(tempBase)) fs.rmSync(resolved, { recursive: true, force: true });
}

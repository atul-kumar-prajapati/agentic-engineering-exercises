#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";

function fail(message) {
  console.error(`extract-release: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument.startsWith("--")) fail(`unexpected argument: ${argument}`);
    const key = argument.slice(2);
    if (!["repo", "range", "output"].includes(key)) fail(`unknown option: ${argument}`);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) fail(`${argument} requires a value`);
    options[key] = value;
    index += 1;
  }
  if (!options.repo) fail("--repo is required");
  if (!options.range) fail("--range is required");
  return options;
}

function runGit(repository, args) {
  try {
    return execFileSync("git", ["-C", repository, ...args], {
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    }).trimEnd();
  } catch (error) {
    const detail = error.stderr?.toString().trim() || error.message;
    fail(`git ${args.join(" ")} failed: ${detail}`);
  }
}

function splitLines(value) {
  return value ? value.split(/\r?\n/).filter(Boolean) : [];
}

const options = parseArgs(process.argv.slice(2));
const repository = path.resolve(options.repo);
runGit(repository, ["rev-parse", "--is-inside-work-tree"]);

const revisionCount = Number(runGit(repository, ["rev-list", "--count", options.range]));
if (!Number.isInteger(revisionCount) || revisionCount < 1) {
  fail(`comparison ${options.range} contains no commits`);
}

const commitRows = splitLines(
  runGit(repository, ["log", "--reverse", "--format=%H%x09%s", options.range]),
);
const commits = commitRows.map((row) => {
  const separator = row.indexOf("\t");
  const sha = row.slice(0, separator);
  const subject = row.slice(separator + 1);
  return {
    sha,
    subject,
    breakingSignal: /(^|\W)BREAKING(?:\W|$)|^[^:]+!:/i.test(subject),
    changedPaths: splitLines(
      runGit(repository, ["diff-tree", "--no-commit-id", "--name-only", "-r", sha]),
    ),
  };
});

const changedPaths = splitLines(runGit(repository, ["diff", "--name-only", options.range]));
const nameStatus = splitLines(runGit(repository, ["diff", "--name-status", options.range]));
const patch = runGit(repository, ["diff", "--no-ext-diff", "--unified=20", options.range]);

const result = {
  repository,
  range: options.range,
  revisionCount,
  commits,
  changedPaths,
  nameStatus,
  patch,
};
const serialized = `${JSON.stringify(result, null, 2)}\n`;

if (options.output) {
  writeFileSync(path.resolve(options.output), serialized, "utf8");
} else {
  process.stdout.write(serialized);
}

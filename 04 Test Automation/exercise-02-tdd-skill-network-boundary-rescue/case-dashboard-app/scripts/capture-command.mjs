import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function fail(message) {
  console.error(`${message}\nUsage: npm run evidence:capture -- --output ../evidence/tdd-commands.jsonl --cycle 1 --phase red -- <command> [args...]`);
  process.exit(2);
}

function runGit(args) {
  const result = spawnSync("git", args, { cwd: process.cwd(), encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : "";
}

function workingTreeHash() {
  const names = runGit(["ls-files", "--modified", "--others", "--exclude-standard"]).split(/\r?\n/).filter(Boolean).sort();
  const hash = crypto.createHash("sha256");
  for (const name of names) {
    const absolute = path.resolve(process.cwd(), name);
    hash.update(`${name}\0`);
    if (fs.existsSync(absolute) && fs.statSync(absolute).isFile()) hash.update(fs.readFileSync(absolute));
    hash.update("\n");
  }
  return hash.digest("hex");
}

const separator = process.argv.indexOf("--", 2);
if (separator < 0 || separator === process.argv.length - 1) fail("A command must follow --.");

const options = process.argv.slice(2, separator);
const commandParts = process.argv.slice(separator + 1);
const valueOf = (name) => {
  const index = options.indexOf(name);
  return index >= 0 ? options[index + 1] : "";
};

const output = valueOf("--output");
const cycle = Number(valueOf("--cycle"));
const phase = valueOf("--phase").toLowerCase();
if (!output || !Number.isInteger(cycle) || cycle < 1 || cycle > 3 || !["red", "green"].includes(phase)) fail("Provide --output, --cycle 1..3, and --phase red|green.");

const exerciseRoot = path.resolve(process.cwd(), "..");
const evidenceRoot = path.join(exerciseRoot, "evidence");
const outputPath = path.resolve(process.cwd(), output);
if (!outputPath.startsWith(evidenceRoot + path.sep) || path.extname(outputPath) !== ".jsonl") fail("Output must be a .jsonl file inside the exercise evidence folder.");

const startedAt = new Date();
const executable = process.platform === "win32" && ["npm", "npx"].includes(commandParts[0]) ? `${commandParts[0]}.cmd` : commandParts[0];
const result = spawnSync(executable, commandParts.slice(1), {
  cwd: process.cwd(),
  encoding: "utf8",
  shell: false,
});
const finishedAt = new Date();
const exitCode = Number.isInteger(result.status) ? result.status : 1;
const record = {
  schema_version: 1,
  cycle,
  phase,
  started_at: startedAt.toISOString(),
  finished_at: finishedAt.toISOString(),
  duration_ms: Math.max(0, finishedAt.getTime() - startedAt.getTime()),
  command: commandParts,
  repository_commit: runGit(["rev-parse", "HEAD"]),
  working_tree_sha256: workingTreeHash(),
  stdout: result.stdout ?? "",
  stderr: result.stderr ?? result.error?.message ?? "",
  exit_code: exitCode,
};
record.record_sha256 = crypto.createHash("sha256").update(JSON.stringify(record)).digest("hex");

fs.mkdirSync(evidenceRoot, { recursive: true });
fs.appendFileSync(outputPath, `${JSON.stringify(record)}\n`, "utf8");
if (record.stdout) process.stdout.write(record.stdout);
if (record.stderr) process.stderr.write(record.stderr);
console.log(`\nCaptured cycle ${cycle} ${phase} with exit code ${exitCode}.`);
process.exit(exitCode);

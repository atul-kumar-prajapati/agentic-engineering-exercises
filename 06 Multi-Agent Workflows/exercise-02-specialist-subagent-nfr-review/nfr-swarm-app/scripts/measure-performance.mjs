import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

function argument(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1];
}

const requestedRef = argument("--ref");
const outputArgument = argument("--out");
if (!requestedRef || !outputArgument) {
  throw new Error("Usage: npm run measure:performance -- --ref <git-ref|worktree> --out <evidence-file>");
}

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const outputPath = path.resolve(appRoot, outputArgument);
if (!outputPath.startsWith(`${exerciseRoot}${path.sep}`)) throw new Error("Performance output must stay inside the exercise directory");

const repositoryRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: appRoot, encoding: "utf8" }).trim();
const appPrefix = `${path.relative(repositoryRoot, appRoot).replaceAll("\\", "/")}/`;
const sourcePath = "src/utils/accessReviewRisk.ts";
const dataPath = "src/data/accessReviews.ts";
const sourceSha = requestedRef === "worktree"
  ? "WORKTREE"
  : execFileSync("git", ["rev-parse", `${requestedRef}^{commit}`], { cwd: repositoryRoot, encoding: "utf8" }).trim();
const source = requestedRef === "worktree"
  ? fs.readFileSync(path.join(appRoot, sourcePath), "utf8")
  : execFileSync("git", ["show", `${sourceSha}:${appPrefix}${sourcePath}`], { cwd: repositoryRoot, encoding: "utf8" });
const dataSource = requestedRef === "worktree"
  ? fs.readFileSync(path.join(appRoot, dataPath), "utf8")
  : execFileSync("git", ["show", `${sourceSha}:${appPrefix}${dataPath}`], { cwd: repositoryRoot, encoding: "utf8" });

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "nfr-performance-"));
try {
  const utilityPath = path.join(temporaryRoot, sourcePath);
  const copiedDataPath = path.join(temporaryRoot, dataPath);
  fs.mkdirSync(path.dirname(utilityPath), { recursive: true });
  fs.mkdirSync(path.dirname(copiedDataPath), { recursive: true });
  fs.writeFileSync(utilityPath, source);
  fs.writeFileSync(copiedDataPath, dataSource);
  const runnerPath = path.join(temporaryRoot, "runner.ts");
  fs.writeFileSync(runnerPath, `
import { performance } from "node:perf_hooks";
import { calculatePortfolioRisk } from "./src/utils/accessReviewRisk.ts";
const sampleSize = 200;
const iterations = 5;
const reviews = Array.from({ length: sampleSize }, (_, index) => ({
  id: String(index), requester: "user", resource: "resource", note: "note",
  risk: index % 80, privileged: index % 4 === 0, evidenceComplete: true, status: "pending" as const,
}));
calculatePortfolioRisk(reviews);
const started = performance.now();
let result = 0;
for (let index = 0; index < iterations; index += 1) result = calculatePortfolioRisk(reviews);
const durationMs = Number((performance.now() - started).toFixed(3));
process.stdout.write(JSON.stringify({ scenario: "portfolio-risk", sampleSize, iterations, durationMs, result }));
`);
  const tsxCli = path.join(appRoot, "node_modules", "tsx", "dist", "cli.mjs");
  const measured = JSON.parse(execFileSync(process.execPath, [tsxCli, runnerPath], { encoding: "utf8" }));
  const evidence = { sourceSha, ...measured };
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify(evidence, null, 2));
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}

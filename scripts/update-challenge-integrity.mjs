import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const additions = new Map([
  ["08 Evidence-led PRs/exercise-01-pr-evidence-pack-automation", ["../fixtures/check-results-multiple-failures.json", "../../../scripts/comparable-evidence.mjs"]],
  ["08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof", ["scripts/fs-rollback-trace-preload.mjs", "../../../scripts/comparable-evidence.mjs"]],
  ["08 Evidence-led PRs/exercise-03-performance-and-a11y-evidence-gate", ["../../../scripts/comparable-evidence.mjs"]],
  ["09 Code Review/exercise-01-security-and-a11y-review-gauntlet", ["scripts/replay-regression-tests.mjs", "scripts/review-component-behavior.test.tsx", "scripts/run-protected-semgrep.mjs", "../../../scripts/comparable-evidence.mjs"]],
  ["09 Code Review/exercise-02-diff-triage-with-fresh-agent", ["scripts/replay-regression-tests.mjs", "scripts/app-cache-behavior.test.tsx", "../../../scripts/comparable-evidence.mjs"]],
  ["09 Code Review/exercise-03-review-regression-lab", ["../docs/skill-contract.md", "../docs/evaluation-contract.md", "eval/verify-catalog.mjs", "skills/regression-review/SKILL.md", "scripts/run-review-session.mjs", "../../../scripts/comparable-evidence.mjs"]],
  ["10 Token Economics/exercise-01-token-budget-refactor", ["../docs/adapter-refactor-request.md", "src/session/adaptSession.mjs", "scripts/run-adapter-acceptance.mjs", "scripts/replay-context-lanes.mjs", "../../../scripts/comparable-evidence.mjs"]],
  ["10 Token Economics/exercise-02-risk-based-model-routing-cost-gate", ["../docs/routing-policy-contract.md", "../evals/recorded-runs.json", "src/routing/dispatchTasks.mjs", "scripts/verify-benchmark-pack.mjs", "../../../scripts/comparable-evidence.mjs"]],
  ["10 Token Economics/exercise-03-minimal-diff-scope-budget", ["src/migration/actionButtons.mjs", "scripts/replay-before-scope.mjs", "../../../scripts/comparable-evidence.mjs"]],
]);

function findManifests(directory, results = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if ([".git", "node_modules", "reports"].includes(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) findManifests(absolute, results);
    else if (entry.name === "challenge-integrity.json") results.push(absolute);
  }
  return results;
}

const digest = (file) => crypto.createHash("sha256").update(fs.readFileSync(file, "utf8").replaceAll("\r\n", "\n")).digest("hex");
let updated = 0;
for (const manifestPath of findManifests(repositoryRoot)) {
  const manifestDirectory = path.dirname(manifestPath);
  const root = fs.existsSync(path.join(manifestDirectory, "package.json"))
    ? manifestDirectory
    : fs.existsSync(path.join(manifestDirectory, "..", "package.json"))
      ? path.resolve(manifestDirectory, "..")
      : manifestDirectory;
  const isApplicationManifest = root === manifestDirectory;
  const relativeManifest = path.relative(repositoryRoot, manifestPath).split(path.sep).join("/");
  const exercise = [...additions.keys()].find((prefix) => relativeManifest.startsWith(`${prefix}/`));
  let document = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (!isApplicationManifest && Object.keys(document.protectedFiles ?? {}).length === 0) {
    document = JSON.parse(execFileSync("git", ["show", `HEAD:${relativeManifest}`], { cwd: repositoryRoot, encoding: "utf8" }));
  }
  const paths = new Set(Object.keys(document.protectedFiles ?? {}));
  const sharedFiles = ["scripts/verify-protected-inputs.mjs", "scripts/run-clean-verification.mjs", "scripts/run-vite-build.mjs"];
  for (const shared of sharedFiles) paths.delete(path.relative(root, path.join(repositoryRoot, shared)).split(path.sep).join("/"));
  if (isApplicationManifest) for (const shared of sharedFiles) {
    paths.add(path.relative(root, path.join(repositoryRoot, shared)).split(path.sep).join("/"));
  }
  if (isApplicationManifest) for (const relative of additions.get(exercise) ?? []) paths.add(relative);
  const protectedFiles = {};
  for (const relative of [...paths].sort()) {
    const absolute = path.resolve(root, relative);
    if (fs.existsSync(absolute) && fs.statSync(absolute).isFile()) protectedFiles[relative] = digest(absolute);
  }
  fs.writeFileSync(manifestPath, `${JSON.stringify({ algorithm: "sha256-normalized-lf", protectedFiles }, null, 2)}\n`);
  updated += 1;
}
console.log(`Updated ${updated} challenge integrity manifests.`);

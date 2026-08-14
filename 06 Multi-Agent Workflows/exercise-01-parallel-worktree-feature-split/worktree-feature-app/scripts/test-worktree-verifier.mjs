import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { verifyLaneSubmission } from "./worktree-verification.mjs";

function run(cwd, args) {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function write(root, relative, content) {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function hash(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "worktree-verifier-self-test-"));
try {
  const repositoryRoot = path.join(temporaryRoot, "repo");
  const exerciseRoot = path.join(repositoryRoot, "exercise");
  const appRoot = path.join(exerciseRoot, "worktree-feature-app");
  const evidenceRoot = path.join(exerciseRoot, "evidence");
  fs.mkdirSync(appRoot, { recursive: true });
  run(repositoryRoot, ["init"]);
  run(repositoryRoot, ["config", "core.autocrlf", "false"]);
  run(repositoryRoot, ["config", "user.name", "Verifier Test"]);
  run(repositoryRoot, ["config", "user.email", "verifier@example.test"]);

  const starterFiles = [
    "src/components/FilterBar.tsx",
    "src/utils/filters.ts",
    "src/components/MetricStrip.tsx",
    "src/utils/scoring.ts",
    "src/components/EvidencePanel.tsx",
    "src/services/workflowApi.ts",
    "src/types.ts",
  ];
  for (const file of starterFiles) write(appRoot, file, `// starter ${file}\n`);
  run(repositoryRoot, ["add", "."]);
  run(repositoryRoot, ["commit", "-m", "test: create base"]);
  const baseSha = run(repositoryRoot, ["rev-parse", "HEAD"]);

  const laneDefinitions = {
    A: {
      branch: "lane/saved-filters",
      files: {
        "src/components/FilterBar.tsx": "export const filterBar = true;\n",
        "src/utils/filters.ts": "export interface FilterPreset { id: string }\nexport const presets = [];\n",
        "tests/lane-a/saved-filter.test.ts": "// lane A test\n",
      },
      command: "npm run test:lane-a",
      output: "evidence/commands/lane-a.txt",
      owned: ["src/components/FilterBar.tsx", "src/utils/filters.ts", "tests/lane-a/"],
      shared: [{ path: "src/types.ts", symbol: "FilterPreset", reason: "Promote the reusable preset contract." }],
    },
    B: {
      branch: "lane/sla-risk",
      files: {
        "src/components/MetricStrip.tsx": "export const dueTodayMetric = true;\n",
        "src/utils/scoring.ts": "export const dueToday = 1;\n",
        "tests/lane-b/due-today.test.ts": "// lane B test\n",
      },
      command: "npm run test:lane-b",
      output: "evidence/commands/lane-b.txt",
      owned: ["src/components/MetricStrip.tsx", "src/utils/scoring.ts", "tests/lane-b/"],
      shared: [],
    },
    C: {
      branch: "lane/evidence-export",
      files: {
        "src/components/EvidencePanel.tsx": "export const evidenceExport = true;\n",
        "src/services/workflowApi.ts": "export interface EvidenceBundle { id: string }\nexport const bundle = true;\n",
        "tests/lane-c/evidence-export.test.ts": "// lane C test\n",
      },
      command: "npm run test:lane-c",
      output: "evidence/commands/lane-c.txt",
      owned: ["src/components/EvidencePanel.tsx", "src/services/workflowApi.ts", "tests/lane-c/"],
      shared: [{ path: "src/types.ts", symbol: "EvidenceBundle", reason: "Promote the reusable export contract." }],
    },
  };

  const commits = {};
  const handoffs = [];
  const worktreeRecords = [];
  const outputContents = {};
  for (const lane of ["A", "B", "C"]) {
    const definition = laneDefinitions[lane];
    run(repositoryRoot, ["switch", "-c", definition.branch, baseSha]);
    for (const [file, content] of Object.entries(definition.files)) write(appRoot, file, content);
    run(repositoryRoot, ["add", "."]);
    run(repositoryRoot, ["commit", "-m", `lane-${lane.toLowerCase()}: complete test slice`, "-m", `Lane: ${lane}\nBase-SHA: ${baseSha}`]);
    commits[lane] = run(repositoryRoot, ["rev-parse", "HEAD"]);
    outputContents[lane] = `PASS Lane ${lane} focused acceptance suite completed with 2 passing tests and exit code 0.\n`;
    const worktreePath = path.join(temporaryRoot, `lane-${lane.toLowerCase()}`);
    worktreeRecords.push(`worktree ${worktreePath}\nHEAD ${commits[lane]}\nbranch refs/heads/${definition.branch}`);
  }

  run(repositoryRoot, ["switch", "-c", "integration/parallel-features", baseSha]);
  const mergeCommits = {};
  for (const lane of ["B", "A", "C"]) {
    run(repositoryRoot, ["merge", "--no-ff", laneDefinitions[lane].branch, "-m", `merge lane ${lane}`]);
    mergeCommits[lane] = run(repositoryRoot, ["rev-parse", "HEAD"]);
  }
  write(appRoot, "src/types.ts", "export interface FilterPreset { id: string }\nexport interface EvidenceBundle { id: string }\n");
  write(appRoot, "src/utils/filters.ts", 'import type { FilterPreset } from "../types";\nexport const presets: FilterPreset[] = [];\n');
  write(appRoot, "src/services/workflowApi.ts", 'import type { EvidenceBundle } from "../types";\nexport const bundle: EvidenceBundle = { id: "x" };\n');
  run(repositoryRoot, ["add", "."]);
  run(repositoryRoot, ["commit", "-m", "integration: promote shared lane contracts"]);
  const productHead = run(repositoryRoot, ["rev-parse", "HEAD"]);

  for (const lane of ["A", "B", "C"]) {
    const definition = laneDefinitions[lane];
    const outputFile = path.join(exerciseRoot, definition.output);
    write(exerciseRoot, definition.output, outputContents[lane]);
    const worktreePath = path.join(temporaryRoot, `lane-${lane.toLowerCase()}`);
    handoffs.push({
      lane,
      agent: `test-agent-${lane}`,
      branch: definition.branch,
      worktree_path: worktreePath,
      status: "ready",
      base_sha: baseSha,
      commit_sha: commits[lane],
      owned_paths: definition.owned,
      changed_paths: Object.keys(definition.files).sort(),
      shared_requests: definition.shared,
      verification: { command: definition.command, exit_code: 0, output_path: definition.output, output_sha256: hash(outputFile) },
      rollback: `git revert ${commits[lane]}`,
      risks: "none",
    });
  }
  write(exerciseRoot, "evidence/worktree-list-before.txt", `${worktreeRecords.join("\n\n")}\n`);
  write(exerciseRoot, "evidence/worktree-list-after.txt", `worktree ${repositoryRoot}\nHEAD ${productHead}\nbranch refs/heads/integration/parallel-features\n`);
  write(exerciseRoot, "evidence/commands/integrated.txt", "PASS Integrated acceptance suite completed with 6 passing tests and exit code 0.\n");
  write(exerciseRoot, "evidence/lane-handoffs.json", JSON.stringify({ schema_version: 1, base_sha: baseSha, lanes: handoffs }, null, 2));
  const integrationOutput = path.join(evidenceRoot, "commands", "integrated.txt");
  write(exerciseRoot, "evidence/integration.json", JSON.stringify({
    schema_version: 1,
    base_sha: baseSha,
    integration_branch: "integration/parallel-features",
    merge_order: ["B", "A", "C"],
    merge_commits: mergeCommits,
    shared_commit_sha: productHead,
    product_head: productHead,
    verification: {
      command: "npm run test:integrated",
      exit_code: 0,
      output_path: "evidence/commands/integrated.txt",
      output_sha256: hash(integrationOutput),
    },
  }, null, 2));
  write(exerciseRoot, "evidence/integration.md", "# Integration\n\nLane review completed. Shared request handling followed merge order B, A, C. No conflict was hidden. The shared-type commit resolved promotion. Final check passed. Cleanup removed worktrees. Remaining risk is none. Rollback reverses shared-type and merge commits.\n");
  run(repositoryRoot, ["add", "."]);
  run(repositoryRoot, ["commit", "-m", "evidence: record parallel integration"]);

  const failures = verifyLaneSubmission({ repositoryRoot, appRoot, exerciseRoot });
  assert.deepEqual(failures, []);
  const tampered = JSON.parse(fs.readFileSync(path.join(evidenceRoot, "lane-handoffs.json"), "utf8"));
  tampered.lanes[0].changed_paths.push("src/types.ts");
  fs.writeFileSync(path.join(evidenceRoot, "lane-handoffs.json"), JSON.stringify(tampered));
  assert.ok(verifyLaneSubmission({ repositoryRoot, appRoot, exerciseRoot }).some((failure) => failure.includes("changed_paths do not match Git")));
  console.log("worktree history and evidence verifier self-test passed");
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}

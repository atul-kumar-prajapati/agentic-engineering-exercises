import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const failures = [];
const taskPrompt = "Repair the case dashboard test-first. Prove loading, success, server-empty, filtered-empty, request error, and retry recovery through GET /api/cases. Make the network test boundary strict and isolated.";

function sha256(absolutePath) {
  const content = fs.readFileSync(absolutePath, "utf8").replaceAll("\r\n", "\n");
  return crypto.createHash("sha256").update(content).digest("hex");
}

function verifyProtectedInputs() {
  const manifestPath = path.join(appRoot, "challenge-integrity.json");
  if (!fs.existsSync(manifestPath)) {
    failures.push("challenge integrity manifest is missing");
    return;
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  for (const [relativePath, expectedHash] of Object.entries(manifest.protectedFiles ?? {})) {
    const absolutePath = path.resolve(appRoot, relativePath);
    if (!fs.existsSync(absolutePath)) failures.push(`protected challenge file is missing: ${relativePath}`);
    else if (sha256(absolutePath) !== expectedHash) failures.push(`protected challenge file was changed: ${relativePath}`);
  }
}

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolutePath) : [absolutePath];
  });
}

function readRequired(relativePath) {
  const absolutePath = path.join(exerciseRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing required evidence file: ${relativePath}`);
    return "";
  }
  const content = fs.readFileSync(absolutePath, "utf8");
  if (!content.trim()) failures.push(`evidence file is empty: ${relativePath}`);
  return content;
}

function field(content, name) {
  return content.match(new RegExp(`^- ${name}:\\s*(.+)$`, "mi"))?.[1].trim() ?? "";
}

function rejectPlaceholders(relativePath, content) {
  for (const pattern of [
    /\b(?:TODO|TBD|FIXME)\b/i,
    /\[(?:name|model|enabled|permission|version|path|40-character|64-character|replace|record)[^\]]*\]/i,
  ]) {
    if (pattern.test(content)) failures.push(`${relativePath} contains an instructional placeholder`);
  }
}

verifyProtectedInputs();

const excludedTests = new Set([
  "src/App.weak.test.tsx",
  "src/App.acceptance.test.tsx",
  "src/utils/scoring.test.ts",
]);
const participantTests = walk(path.join(appRoot, "src"))
  .filter((absolutePath) => /\.test\.tsx?$/.test(absolutePath))
  .filter((absolutePath) => !excludedTests.has(path.relative(appRoot, absolutePath).replaceAll("\\", "/")))
  .map((absolutePath) => ({
    relativePath: path.relative(appRoot, absolutePath).replaceAll("\\", "/"),
    source: fs.readFileSync(absolutePath, "utf8"),
  }));
const tests = participantTests.map(({ source }) => source).join("\n");
const setupPath = path.join(appRoot, "src", "test", "setup.ts");
const setup = fs.existsSync(setupPath) ? fs.readFileSync(setupPath, "utf8") : "";

if (participantTests.length === 0) failures.push("no participant network component test was found");
const testCount = [...tests.matchAll(/\b(?:it|test)\s*\(/g)].length;
if (testCount < 6) failures.push("component coverage must contain at least six independent tests");

for (const term of [
  "Loading cases...",
  "Northstar Health",
  "No cases are assigned yet.",
  "No cases match",
  "We could not load cases",
  "Retry",
  "Recovered Co",
  "/api/cases",
]) {
  if (!tests.includes(term)) failures.push(`participant tests do not prove ${term}`);
}
for (const term of ["server.use", "http.get", "HttpResponse", "userEvent", "screen."]) {
  if (!tests.includes(term)) failures.push(`participant tests do not use ${term}`);
}
if (!/http\.get\s*\(\s*["']\/api\/cases["']/.test(tests)) failures.push("tests do not control the real GET /api/cases seam");
if (!/(?:get|find|query)By(?:Role|LabelText|Text)/.test(tests)) failures.push("tests do not use user-visible Testing Library queries");
if (/(?:vi|jest)\.mock|mockImplementation|spyOn\s*\(|(?:globalThis|global|window)\.fetch|querySelector|\.container\b|getByTestId/.test(tests)) {
  failures.push("tests mock internals, bypass the request seam, or use implementation-coupled queries");
}
if (!/(?:requests|requestCount).{0,120}toBe\s*\(\s*1\s*\)/is.test(tests)) {
  failures.push("filtered-empty coverage does not prove filtering sends no new request");
}
if (!/(?:requests|requestCount).{0,180}toBe\s*\(\s*2\s*\)/is.test(tests)) {
  failures.push("retry coverage does not prove exactly two total requests");
}
if (!/onUnhandledRequest:\s*["']error["']/.test(setup)) failures.push("MSW does not fail unhandled requests");
if (!/afterEach\s*\([^)]*(?:server\.)?resetHandlers|afterEach\s*\(\s*\(\)\s*=>\s*\{[\s\S]{0,300}server\.resetHandlers/.test(setup)) {
  failures.push("MSW runtime handlers are not reset after every test");
}

const evidencePaths = [
  "evidence/before.md",
  "evidence/before.patch",
  "evidence/after.md",
  "evidence/after.patch",
  "evidence/skill-record.md",
  "evidence/tdd-cycles.md",
  "evidence/tdd-commands.jsonl",
  "evidence/network-boundaries.md",
  "evidence/comparison.md",
  "evidence/network-run.txt",
];
const evidence = Object.fromEntries(evidencePaths.map((relativePath) => [relativePath, readRequired(relativePath)]));

if (failures.some((failure) => failure.startsWith("missing required evidence"))) {
  console.error("TDD submission verification failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

for (const relativePath of evidencePaths.filter((name) => name.endsWith(".md"))) {
  rejectPlaceholders(relativePath, evidence[relativePath]);
}

const before = evidence["evidence/before.md"];
const after = evidence["evidence/after.md"];
for (const name of ["Agent", "Model", "Other tools", "Permissions", "Time limit", "Prompt", "Attempt"]) {
  const beforeValue = field(before, name);
  const afterValue = field(after, name);
  if (!beforeValue || !afterValue) failures.push(`before.md and after.md must both record ${name}`);
  if (beforeValue && afterValue && beforeValue.toLowerCase() !== afterValue.toLowerCase()) {
    failures.push(`before and after conditions differ for ${name}`);
  }
}
if (field(before, "Prompt") !== taskPrompt || field(after, "Prompt") !== taskPrompt) {
  failures.push("before.md and after.md must record the exact dashboard request");
}
if (field(before, "Attempt") !== "1" || field(after, "Attempt") !== "1") {
  failures.push("both implementation sessions must be recorded as first attempts");
}
if (!/disabled/i.test(field(before, "TDD skill")) || !/enabled/i.test(field(after, "TDD skill"))) {
  failures.push("before.md and after.md must record the TDD skill boundary");
}
for (const [name, patch] of [["before.patch", evidence["evidence/before.patch"]], ["after.patch", evidence["evidence/after.patch"]]]) {
  if (!patch.includes("diff --git") || !patch.includes("@@") || patch.length < 500) failures.push(`evidence/${name} is not a genuine implementation patch`);
  if (!/App(?:\.[^\s]+)?\.(?:tsx|ts)/.test(patch)) failures.push(`evidence/${name} does not include dashboard code or tests`);
}
if (evidence["evidence/before.patch"] === evidence["evidence/after.patch"]) failures.push("before.patch and after.patch must differ");

const skillRecord = evidence["evidence/skill-record.md"];
if (!skillRecord.includes("https://github.com/mattpocock/skills/tree/main/skills/engineering/tdd")) failures.push("skill-record.md has the wrong TDD skill source");
if (!skillRecord.includes("npx skills add mattpocock/skills --skill tdd")) failures.push("skill-record.md is missing the install command");
if (!/Source commit:\s*[0-9a-f]{40}\b/i.test(skillRecord)) failures.push("skill-record.md is missing a 40-character source commit");
if (!/Installed path:\s*.+tdd[\\/]SKILL\.md\s*$/mi.test(skillRecord)) failures.push("skill-record.md is missing the installed TDD SKILL.md path");
if (!/SKILL\.md SHA-256:\s*[0-9a-f]{64}\b/i.test(skillRecord)) failures.push("skill-record.md is missing the SKILL.md SHA-256");

const cycles = evidence["evidence/tdd-cycles.md"];
let commandRecords = [];
try {
  commandRecords = evidence["evidence/tdd-commands.jsonl"].split(/\r?\n/).filter(Boolean).map((line, index) => {
    const record = JSON.parse(line);
    const submittedHash = record.record_sha256;
    delete record.record_sha256;
    const expectedHash = crypto.createHash("sha256").update(JSON.stringify(record)).digest("hex");
    record.record_sha256 = submittedHash;
    if (submittedHash !== expectedHash) failures.push(`tdd-commands.jsonl record ${index + 1} has an invalid record hash`);
    if (record.schema_version !== 1) failures.push(`tdd-commands.jsonl record ${index + 1} has an unsupported schema version`);
    if (![1, 2, 3].includes(record.cycle) || !["red", "green"].includes(record.phase)) failures.push(`tdd-commands.jsonl record ${index + 1} has an invalid cycle or phase`);
    if (!/^\d{4}-\d{2}-\d{2}T/.test(record.started_at ?? "") || !Number.isFinite(Date.parse(record.started_at))) failures.push(`tdd-commands.jsonl record ${index + 1} has an invalid UTC timestamp`);
    if (!/^\d{4}-\d{2}-\d{2}T/.test(record.finished_at ?? "") || !Number.isFinite(Date.parse(record.finished_at))) failures.push(`tdd-commands.jsonl record ${index + 1} has an invalid finish timestamp`);
    if (Date.parse(record.finished_at) < Date.parse(record.started_at)) failures.push(`tdd-commands.jsonl record ${index + 1} finishes before it starts`);
    if (!Number.isInteger(record.duration_ms) || record.duration_ms < 0 || Math.abs(record.duration_ms - (Date.parse(record.finished_at) - Date.parse(record.started_at))) > 5) failures.push(`tdd-commands.jsonl record ${index + 1} has an invalid duration`);
    if (!Array.isArray(record.command) || !record.command.length) failures.push(`tdd-commands.jsonl record ${index + 1} is missing the exact command`);
    if (!/^[a-f0-9]{40}$/i.test(record.repository_commit ?? "")) failures.push(`tdd-commands.jsonl record ${index + 1} has an invalid repository commit`);
    if (!/^[a-f0-9]{64}$/i.test(record.working_tree_sha256 ?? "")) failures.push(`tdd-commands.jsonl record ${index + 1} has an invalid working-tree hash`);
    if (!Number.isInteger(record.exit_code)) failures.push(`tdd-commands.jsonl record ${index + 1} has no exit code`);
    if (typeof record.stdout !== "string" || typeof record.stderr !== "string") failures.push(`tdd-commands.jsonl record ${index + 1} must preserve stdout and stderr`);
    return record;
  });
} catch {
  failures.push("tdd-commands.jsonl must contain valid JSON objects, one per line");
}

for (const [heading, nextHeading] of [["Cycle 1", "Cycle 2"], ["Cycle 2", "Cycle 3"], ["Cycle 3", null]]) {
  const start = cycles.indexOf(heading);
  const end = nextHeading ? cycles.indexOf(nextHeading, start + heading.length) : cycles.length;
  const block = start >= 0 ? cycles.slice(start, end >= 0 ? end : cycles.length) : "";
  if (!block) {
    failures.push(`tdd-cycles.md is missing ${heading}`);
    continue;
  }
  const red = block.search(/\bRed\b/i);
  const green = block.search(/\bGreen\b/i);
  if (red < 0 || green < 0 || red >= green) failures.push(`${heading} does not show red before green`);
  if (!/test-only diff/i.test(block)) failures.push(`${heading} is missing its test-only diff record`);
  if (!/tdd-commands\.jsonl/i.test(block)) failures.push(`${heading} must reference its machine-captured command evidence`);
}
for (const cycleNumber of [1, 2, 3]) {
  const redIndex = commandRecords.findIndex((record) => record.cycle === cycleNumber && record.phase === "red");
  const greenIndex = commandRecords.findIndex((record) => record.cycle === cycleNumber && record.phase === "green");
  const red = commandRecords[redIndex];
  const green = commandRecords[greenIndex];
  if (!red) failures.push(`tdd-commands.jsonl is missing cycle ${cycleNumber} red evidence`);
  if (!green) failures.push(`tdd-commands.jsonl is missing cycle ${cycleNumber} green evidence`);
  if (red && red.exit_code === 0) failures.push(`cycle ${cycleNumber} red command did not fail`);
  if (green && green.exit_code !== 0) failures.push(`cycle ${cycleNumber} green command did not pass`);
  if (red && green && redIndex >= greenIndex) failures.push(`cycle ${cycleNumber} JSONL records are not in red-before-green order`);
  if (red && green && Date.parse(red.finished_at) > Date.parse(green.started_at)) failures.push(`cycle ${cycleNumber} does not show red before green`);
}
for (const behavior of ["loading", "filtered-empty", "retry", "final review"]) {
  if (!cycles.toLowerCase().includes(behavior)) failures.push(`tdd-cycles.md is missing ${behavior}`);
}

const boundaries = evidence["evidence/network-boundaries.md"];
for (const item of ["loading", "success", "server-empty", "filtered-empty", "request error", "retry", "unhandled", "resetHandlers", "test", "assertion"]) {
  if (!boundaries.toLowerCase().includes(item.toLowerCase())) failures.push(`network-boundaries.md is missing ${item}`);
}

const comparison = evidence["evidence/comparison.md"];
for (const item of ["fair", "public seam", "implementation order", "red", "production", "isolation", "coverage", "verification", "changed files", "skill"]) {
  if (!comparison.toLowerCase().includes(item)) failures.push(`comparison.md must discuss ${item}`);
}

const networkRun = evidence["evidence/network-run.txt"];
if (!networkRun.includes("npm run test:network")) failures.push("network-run.txt is missing npm run test:network");
for (const seed of [104, 108, 220]) {
  if (!networkRun.includes(`Network stability seed: ${seed}`)) failures.push(`network-run.txt is missing shuffle seed ${seed}`);
}
if (!/Exit code:\s*0\b/i.test(networkRun)) failures.push("network-run.txt does not record exit code 0");
if (!/Network stability passed/i.test(networkRun) || /\bfailed\b/i.test(networkRun)) failures.push("network-run.txt does not prove a clean shuffled run");

for (const command of ["npm run test:smoke", "npm run test:acceptance", "npm run test:network", "npm run test:tdd", "npm run agent:check"]) {
  if (!after.includes(command)) failures.push(`after.md must record ${command}`);
}

if (failures.length) {
  console.error("TDD submission verification failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`TDD submission verification passed: ${testCount} participant tests, strict MSW isolation, comparable first attempts, three ordered cycles, six states, and shuffled stability evidence.`);

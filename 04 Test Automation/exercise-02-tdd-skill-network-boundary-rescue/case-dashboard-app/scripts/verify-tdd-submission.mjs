import fs from "node:fs";
import path from "node:path";

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const failures = [];
const testSources = fs.readdirSync(path.join(appRoot, "src"), { recursive: true })
  .filter((name) => typeof name === "string" && /\.test\.tsx?$/.test(name))
  .map((name) => fs.readFileSync(path.join(appRoot, "src", name), "utf8"))
  .join("\n");
for (const term of ["Loading cases", "Northstar Health", "No cases are assigned", "No cases match", "could not load cases", "Retry"]) {
  if (!testSources.includes(term)) failures.push(`tests do not independently assert ${term}`);
}
const setup = fs.readFileSync(path.join(appRoot, "src", "test", "setup.ts"), "utf8");
if (!/onUnhandledRequest:\s*["']error["']/.test(setup)) failures.push("MSW does not fail unhandled requests");
if (!/afterEach\s*\([^)]*resetHandlers|afterEach\s*\(\(\)\s*=>\s*server\.resetHandlers/.test(setup)) failures.push("MSW handlers are not reset after every test");

const evidence = ["evidence/tdd-cycles.md", "evidence/red.patch", "evidence/green.patch", "evidence/network-boundaries.md"];
const values = {};
for (const relative of evidence) {
  const absolute = path.join(exerciseRoot, relative);
  if (!fs.existsSync(absolute)) {
    failures.push(`missing ${relative}`);
    values[relative] = "";
  } else values[relative] = fs.readFileSync(absolute, "utf8");
}
for (const phase of ["red", "green", "refactor", "exit code", "npm run test:component"]) {
  if (!values["evidence/tdd-cycles.md"].toLowerCase().includes(phase)) failures.push(`tdd-cycles.md is missing ${phase}`);
}
for (const patch of ["evidence/red.patch", "evidence/green.patch"]) {
  if (!values[patch].includes("diff --git") || !values[patch].includes("App")) failures.push(`${patch} is not a genuine patch`);
}
if (values["evidence/red.patch"] === values["evidence/green.patch"]) failures.push("red and green patches must differ");
for (const state of ["loading", "success", "server-empty", "filtered-empty", "error", "retry"]) {
  if (!values["evidence/network-boundaries.md"].toLowerCase().includes(state)) failures.push(`network-boundaries.md is missing ${state}`);
}
if (failures.length) {
  console.error("TDD submission verification failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}
console.log("TDD cycles, six states, and strict network isolation are documented and executable.");

import path from "node:path";
import { fileURLToPath } from "node:url";
import { releaseSteps, runReleaseGate } from "../../scripts/verification-gate.mjs";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const exerciseRoot = path.resolve(appRoot, "..");
const expected = [
  { id: "gate-contract", command: "npm", args: ["run", "test:gate"], cwd: appRoot },
  { id: "client-release", command: "npm", args: ["run", "test:release"], cwd: appRoot },
  { id: "client-quality-build", command: "npm", args: ["run", "agent:check"], cwd: appRoot },
  {
    id: "provider-tests-build",
    command: process.platform === "win32" ? "mvnw.cmd" : "./mvnw",
    args: ["-q", "verify"],
    cwd: path.join(exerciseRoot, "workflow-rules-api"),
  },
];

const failures = [];
const silentLogger = { log() {}, error() {} };
const normalize = (value) => path.resolve(value).toLowerCase();

if (!Array.isArray(releaseSteps)) {
  failures.push("releaseSteps must be an array");
} else {
  if (releaseSteps.length !== expected.length) {
    failures.push(`releaseSteps must contain exactly ${expected.length} steps`);
  }
  expected.forEach((required, index) => {
    const actual = releaseSteps[index];
    if (!actual) return;
    if (actual.id !== required.id) failures.push(`step ${index + 1} must be ${required.id}`);
    if (actual.command !== required.command) failures.push(`${required.id} must use ${required.command}`);
    if (JSON.stringify(actual.args) !== JSON.stringify(required.args)) {
      failures.push(`${required.id} must run ${required.args.join(" ")}`);
    }
    if (normalize(actual.cwd) !== normalize(required.cwd)) {
      failures.push(`${required.id} has the wrong working directory`);
    }
  });
}

const successCalls = [];
const successCode = runReleaseGate(
  releaseSteps,
  (command, args, options) => {
    successCalls.push({ command, args, options });
    return { status: 0 };
  },
  silentLogger,
);
if (successCode !== 0) failures.push("success path must return exit code 0");
if (successCalls.length !== expected.length) failures.push("success path must run every step exactly once");
if (successCalls.some((call) => call.options.stdio !== "inherit" || !call.options.cwd || call.options.shell === true)) {
  failures.push("every step must stream output, set its working directory, and avoid an argument-bearing shell call");
}

const nonZeroCalls = [];
const nonZeroCode = runReleaseGate(
  releaseSteps,
  () => {
    nonZeroCalls.push(nonZeroCalls.length + 1);
    return { status: nonZeroCalls.length === 2 ? 7 : 0 };
  },
  silentLogger,
);
if (nonZeroCode !== 7) failures.push("a non-zero step must be preserved as the gate exit code");
if (nonZeroCalls.length !== 2) failures.push("the gate must stop immediately after a non-zero step");

let spawnCalls = 0;
const spawnErrorCode = runReleaseGate(
  releaseSteps,
  () => {
    spawnCalls += 1;
    return { status: null, error: new Error("command unavailable") };
  },
  silentLogger,
);
if (!Number.isInteger(spawnErrorCode) || spawnErrorCode === 0) {
  failures.push("a process-spawn error must return a non-zero gate exit code");
}
if (spawnCalls !== 1) failures.push("the gate must stop immediately after a process-spawn error");

if (failures.length) {
  console.error("Verification gate contract failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log("PASS gate success path runs all four required surfaces once.");
console.log("PASS gate preserves a non-zero step and stops later work.");
console.log("PASS gate converts a process-spawn error to non-zero and stops later work.");

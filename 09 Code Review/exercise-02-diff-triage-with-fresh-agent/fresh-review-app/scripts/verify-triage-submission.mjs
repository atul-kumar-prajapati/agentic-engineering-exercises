import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { verifyGitBinding, verifyTriageDocument } from "./triage-verification.mjs";

const appRoot = process.cwd();
const exerciseRoot = path.resolve(appRoot, "..");
const repositoryRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: appRoot, encoding: "utf8" }).trim();
const evidenceRoot = path.join(exerciseRoot, "evidence");
const failures = [];
function readJson(file, label) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { failures.push(`missing or invalid ${label}`); return null; }
}
const manifest = readJson(path.join(exerciseRoot, "fixtures", "manifest.json"), "protected manifest");
const expectations = readJson(path.join(exerciseRoot, "fixtures", "review-expectations.json"), "review expectations");
const review = readJson(path.join(evidenceRoot, "review.json"), "evidence/review.json");
const session = readJson(path.join(evidenceRoot, "reviewer-session.json"), "evidence/reviewer-session.json");
if (review && session && manifest && expectations) failures.push(...verifyTriageDocument(review, session, manifest, expectations, exerciseRoot));

const promptPath = path.join(evidenceRoot, "fresh-review-prompt.md");
const prompt = fs.existsSync(promptPath) ? fs.readFileSync(promptPath, "utf8").replaceAll("\r\n", "\n") : "";
const promptHash = crypto.createHash("sha256").update(prompt).digest("hex");
if (prompt.length < 300 || promptHash !== session?.promptSha256) failures.push("fresh prompt is missing, too short, or does not match promptSha256");
for (const excluded of ["implementer-notes", "CACHE-001", "expected finding"]) if (prompt.toLowerCase().includes(excluded.toLowerCase())) failures.push(`fresh prompt leaks excluded context: ${excluded}`);

const markdownPath = path.join(evidenceRoot, "review.md");
const markdown = fs.existsSync(markdownPath) ? fs.readFileSync(markdownPath, "utf8") : "";
for (const term of [manifest?.baseSha, manifest?.headSha, "request changes", ...(expectations?.findings ?? []).map((finding) => finding.id)]) if (term && !markdown.toLowerCase().includes(String(term).toLowerCase())) failures.push(`review.md is missing ${term}`);
const fixture = fs.existsSync(path.join(evidenceRoot, "fixture-verification.txt")) ? fs.readFileSync(path.join(evidenceRoot, "fixture-verification.txt"), "utf8") : "";
if (!fixture.includes(`Fresh-review fixture verified: ${manifest?.comparison}`)) failures.push("fixture verification output is missing or incorrect");
const tests = fs.existsSync(path.join(evidenceRoot, "focused-tests.txt")) ? fs.readFileSync(path.join(evidenceRoot, "focused-tests.txt"), "utf8") : "";
for (const term of ["protected cache acceptance", "filter changes do not clear", "cache-regressions.test.ts", "exit code: 0"]) if (!tests.toLowerCase().includes(term.toLowerCase())) failures.push(`focused test output is missing ${term}`);
if (review?.sourceSha) failures.push(...verifyGitBinding({ repositoryRoot, exerciseRoot, sourceSha: review.sourceSha }));

if (failures.length) {
  console.error(`Triage submission verification failed:\n${[...new Set(failures)].map((failure) => `- ${failure}`).join("\n")}`);
  process.exit(1);
}
console.log(`Source SHA: ${review.sourceSha}`);
console.log("PASS fresh reviewer context and exact prompt binding verified");
console.log("PASS exact protected base-to-head comparison verified");
console.log("PASS four cache blockers and unsupported claim triaged with evidence");
console.log("PASS focused fixes and learner regression tests bound to source SHA");
console.log("PASS later history contains evidence only");

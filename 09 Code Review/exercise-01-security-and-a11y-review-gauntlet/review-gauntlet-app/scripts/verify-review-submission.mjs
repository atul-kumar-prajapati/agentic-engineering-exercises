import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { verifyGitBinding, verifyReviewDocument } from "./review-verification.mjs";

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
if (review && manifest && expectations) failures.push(...verifyReviewDocument(review, manifest, expectations, exerciseRoot));

const markdownPath = path.join(evidenceRoot, "review.md");
const markdown = fs.existsSync(markdownPath) ? fs.readFileSync(markdownPath, "utf8") : "";
for (const term of [manifest?.baseSha, manifest?.headSha, "request changes", ...(expectations?.findings ?? []).map((finding) => finding.id)]) if (term && !markdown.toLowerCase().includes(String(term).toLowerCase())) failures.push(`review.md is missing ${term}`);
const semgrepPath = path.join(evidenceRoot, "semgrep.txt");
const semgrep = fs.existsSync(semgrepPath) ? fs.readFileSync(semgrepPath, "utf8") : "";
for (const term of ["react-dangerous-html-review", "ActionComposer.tsx", "SafeAnnouncement.tsx"]) if (!semgrep.includes(term)) failures.push(`Semgrep evidence is missing ${term}`);
const fixturePath = path.join(evidenceRoot, "fixture-verification.txt");
const fixture = fs.existsSync(fixturePath) ? fs.readFileSync(fixturePath, "utf8") : "";
if (!fixture.includes(`Review fixture verified: ${manifest?.comparison}`)) failures.push("fixture verification output is missing or incorrect");
if (review?.sourceSha) failures.push(...verifyGitBinding({ repositoryRoot, exerciseRoot, sourceSha: review.sourceSha }));

if (failures.length) {
  console.error(`Review submission verification failed:\n${[...new Set(failures)].map((failure) => `- ${failure}`).join("\n")}`);
  process.exit(1);
}
console.log(`Source SHA: ${review.sourceSha}`);
console.log("PASS exact protected base-to-head review range verified");
console.log("PASS five required findings classified with evidence and regression tests");
console.log("PASS dynamic HTML true positive and static false positive decisions verified");
console.log("PASS keyboard, validation, and server policy fixes verified");
console.log("PASS Git source binding and evidence-only follow-up history verified");

import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

function git(root, args) { return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim(); }
export function sha256(value) { return crypto.createHash("sha256").update(value).digest("hex"); }

export function validateGuidance(agents, persistence, corrections) {
  const failures = [];
  const lowerAgents = agents.toLowerCase();
  const lowerPersistence = persistence.toLowerCase();
  if (agents.length > 1200) failures.push("AGENTS.md exceeds 1,200 characters");
  for (const term of [".agent/persistence.md", "persistence", "npm run test:persistence"]) if (!lowerAgents.includes(term)) failures.push(`AGENTS.md is missing ${term}`);
  for (const detail of ["display label", "canonical lowercase", "caller-provided clock", "new date"]) if (lowerAgents.includes(detail)) failures.push(`AGENTS.md duplicates deep detail ${detail}`);
  for (const term of ["stable id", "display label", "trim", "lowercase", "caller-provided clock", "new date", "exception", "product contract", "ui", "export", "log", "npm run test:persistence"]) if (!lowerPersistence.includes(term)) failures.push(`persistence.md is missing ${term}`);
  const counts = new Map();
  for (const correction of corrections) counts.set(correction.rootCause, (counts.get(correction.rootCause) ?? 0) + 1);
  for (const root of ["identity-vs-presentation", "canonical-enum-storage", "ambient-time"]) if ((counts.get(root) ?? 0) < 2) failures.push(`${root} lacks two independent corrections`);
  return failures;
}

export async function applyAndGradePatch({ patchPath, starterPath }) {
  const patchSource = fs.readFileSync(patchPath, "utf8");
  const oldPaths = [...patchSource.matchAll(/^--- a\/(.+)$/gm)].map((match) => match[1].trim());
  const newPaths = [...patchSource.matchAll(/^\+\+\+ b\/(.+)$/gm)].map((match) => match[1].trim());
  if (oldPaths.length !== 1 || newPaths.length !== 1 || oldPaths[0] !== newPaths[0] || !oldPaths[0].endsWith("rule-hardening-app/src/services/filterPersistence.mjs")) throw new Error("patch must modify only filterPersistence.mjs");
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "rule-hardening-"));
  try {
    const target = path.join(temporary, ...oldPaths[0].split("/"));
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(starterPath, target);
    execFileSync("git", ["apply", "--check", patchPath], { cwd: temporary, stdio: "pipe" });
    execFileSync("git", ["apply", patchPath], { cwd: temporary, stdio: "pipe" });
    const source = fs.readFileSync(target, "utf8").replaceAll("\r\n", "\n");
    const { buildSavedFilter } = await import(`${pathToFileURL(target).href}?v=${sha256(patchSource)}`);
    const defects = [];
    const now = "2026-08-12T09:00:00.000Z";
    let clockCalls = 0;
    const input = { owner: { id: "user-42", label: "Asha Nair" }, statusLabel: " Blocked " };
    const original = structuredClone(input);
    let result;
    try { result = buildSavedFilter(input, () => { clockCalls += 1; return now; }); } catch { defects.push("builder throws"); }
    if (result?.ownerId !== "user-42") defects.push("stable owner ID not stored");
    if (result?.status !== "blocked") defects.push("status not canonical lowercase");
    if (result?.updatedAt !== now) defects.push("caller clock not used");
    if (JSON.stringify(Object.keys(result ?? {}).sort()) !== JSON.stringify(["ownerId", "status", "updatedAt"])) defects.push("durable record shape changed");
    if (clockCalls !== 1) defects.push("clock not called exactly once");
    if (JSON.stringify(input) !== JSON.stringify(original)) defects.push("input mutated");
    return { defects, source, patchSha256: sha256(patchSource) };
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

export function verifyRuleHistory({ repositoryRoot, exerciseRoot, baselineSha, rulesSha, implementationSha }) {
  const failures = [];
  try {
    if (git(repositoryRoot, ["rev-parse", `${rulesSha}^`]) !== baselineSha) failures.push("rulesSha must directly follow baselineSha");
    git(repositoryRoot, ["merge-base", "--is-ancestor", rulesSha, implementationSha]);
    git(repositoryRoot, ["merge-base", "--is-ancestor", implementationSha, "HEAD"]);
    const prefix = path.relative(repositoryRoot, exerciseRoot).split(path.sep).join("/");
    const rulesFiles = [`${prefix}/.agent/persistence.md`, `${prefix}/AGENTS.md`].sort();
    for (const file of rulesFiles) {
      try { git(repositoryRoot, ["cat-file", "-e", `${baselineSha}:${file}`]); failures.push(`${file} must not exist at baselineSha`); } catch { /* expected */ }
    }
    const actualRules = git(repositoryRoot, ["diff-tree", "--no-commit-id", "--name-only", "-r", rulesSha]).split(/\r?\n/).filter(Boolean).sort();
    if (JSON.stringify(actualRules) !== JSON.stringify(rulesFiles)) failures.push("rulesSha must contain only AGENTS.md and persistence.md");
    const implementationFiles = [
      `${prefix}/rule-hardening-app/src/services/filterPersistence.mjs`,
      `${prefix}/rule-hardening-app/src/services/filterPersistence.test.mjs`,
    ].sort();
    const actualImplementation = git(repositoryRoot, ["diff-tree", "--no-commit-id", "--name-only", "-r", implementationSha]).split(/\r?\n/).filter(Boolean).sort();
    if (JSON.stringify(actualImplementation) !== JSON.stringify(implementationFiles)) failures.push("implementationSha must contain only final source and participant test");
    const later = git(repositoryRoot, ["diff", "--name-only", implementationSha, "HEAD"]).split(/\r?\n/).filter(Boolean);
    for (const file of later) if (!file.startsWith(`${prefix}/evidence/`)) failures.push(`commit after implementationSha changes non-evidence file ${file}`);
  } catch { failures.push("baseline, rules, and implementation SHAs must be ordered ancestor commits"); }
  return failures;
}

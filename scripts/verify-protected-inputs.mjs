import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const manifestArgument = process.argv[2];
if (!manifestArgument) throw new Error("Usage: node scripts/verify-protected-inputs.mjs <manifest.json>");
const manifestPath = path.resolve(manifestArgument);
const manifestRoot = path.dirname(manifestPath);
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const failures = [];

const trustedRef = process.env.CHALLENGE_TRUSTED_REF;
if (trustedRef) {
  try {
    const repositoryRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: manifestRoot, encoding: "utf8" }).trim();
    const relativeManifest = path.relative(repositoryRoot, manifestPath).split(path.sep).join("/");
    const trusted = execFileSync("git", ["show", `${trustedRef}:${relativeManifest}`], { cwd: repositoryRoot, encoding: "utf8" });
    if (trusted.replaceAll("\r\n", "\n").trim() !== fs.readFileSync(manifestPath, "utf8").replaceAll("\r\n", "\n").trim()) {
      failures.push(`protected manifest differs from trusted ref ${trustedRef}`);
    }
  } catch {
    failures.push(`unable to load protected manifest from trusted ref ${trustedRef}`);
  }
}

for (const [relative, expected] of Object.entries(manifest.protectedFiles ?? {})) {
  const absolute = path.resolve(manifestRoot, relative);
  if (!fs.existsSync(absolute)) {
    failures.push(`missing protected input: ${relative}`);
    continue;
  }
  const normalized = fs.readFileSync(absolute, "utf8").replaceAll("\r\n", "\n");
  const actual = crypto.createHash("sha256").update(normalized).digest("hex");
  if (actual !== expected) failures.push(`protected input changed: ${relative}`);
}

if (failures.length) {
  console.error("Challenge integrity failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}
console.log(`Verified ${Object.keys(manifest.protectedFiles ?? {}).length} protected challenge inputs.`);

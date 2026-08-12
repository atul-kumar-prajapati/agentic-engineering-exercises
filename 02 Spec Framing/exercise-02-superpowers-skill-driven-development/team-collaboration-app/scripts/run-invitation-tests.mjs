import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const servicePath = path.join(root, "src", "services", "invitationService.ts");
const service = fs.readFileSync(servicePath, "utf8");

if (service.includes("Invitation lifecycle is not implemented")) {
  console.error("Invitation tests failed: implement createInvitation, acceptInvitation, and revokeInvitation in src/services/invitationService.ts.");
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  ["--experimental-strip-types", "--test", "./tests/invitationService.test.ts"],
  { cwd: root, encoding: "utf8" }
);

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
process.exit(result.status ?? 1);

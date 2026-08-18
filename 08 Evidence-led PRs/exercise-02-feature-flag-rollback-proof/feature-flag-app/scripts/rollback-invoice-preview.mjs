#!/usr/bin/env node
/**
 * Atomic, no-deploy kill switch for invoice-preview-v2.
 *
 * Reviewers can disable the rollout immediately by pointing this command at a
 * configuration file (typically a temporary copy of the live flag document).
 * Invalid input is rejected before any mutation. Successful rollback writes the
 * disabled document to a sibling temp file and rename()s it into place.
 *
 * Usage:
 *   node scripts/rollback-invoice-preview.mjs \
 *     --config <path-to-config.json> \
 *     --actor <operator> \
 *     --reason <why-this-rollback> \
 *     --timestamp <iso-or-epoch>
 */

import { readFile, writeFile, rename, unlink } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const FLAG_KEY = "invoice-preview-v2";
const REQUIRED_FLAGS = ["--config", "--actor", "--reason", "--timestamp"];

function digest(text) {
  return createHash("sha256").update(text).digest("hex");
}

function fail(message) {
  console.error(JSON.stringify({ ok: false, error: message, flagKey: FLAG_KEY }));
  process.exit(1);
}

function parseArgs(argv) {
  const parsed = {
    config: null,
    actor: null,
    reason: null,
    timestamp: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const next = argv[index + 1];

    if (token === "--config" || token === "--actor" || token === "--reason" || token === "--timestamp") {
      if (next === undefined || next.startsWith("--")) {
        throw new Error(`Missing value for ${token}`);
      }
      parsed[token.slice(2)] = next;
      index += 1;
      continue;
    }

    if (token === "--help" || token === "-h") {
      parsed.help = true;
      continue;
    }

    throw new Error(`Unknown argument: ${token}`);
  }

  return parsed;
}

function requireNonEmpty(label, value) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} is required`);
  }
  return value.trim();
}

function validateConfigDocument(document) {
  if (document === null || typeof document !== "object" || Array.isArray(document)) {
    throw new Error("Config must be a JSON object");
  }
  if (document.flagKey !== FLAG_KEY) {
    throw new Error(`flagKey must be ${FLAG_KEY}`);
  }
  if (typeof document.schemaVersion !== "number") {
    throw new Error("schemaVersion must be a number");
  }
  if (typeof document.enabled !== "boolean") {
    throw new Error("enabled must be a boolean");
  }
  if (!Array.isArray(document.allowlist) || document.allowlist.some((entry) => typeof entry !== "string")) {
    throw new Error("allowlist must be an array of strings");
  }
  if (document.revision !== undefined && typeof document.revision !== "string") {
    throw new Error("revision must be a string when present");
  }
  return document;
}

function buildRolledBackDocument(current, { actor, reason, timestamp }) {
  const previousRevision = typeof current.revision === "string" ? current.revision : null;
  return {
    schemaVersion: current.schemaVersion,
    flagKey: FLAG_KEY,
    enabled: false,
    allowlist: [],
    revision: `rollback-${timestamp}`,
    previousRevision,
    audit: {
      action: "rollback",
      actor,
      reason,
      timestamp,
      previousRevision,
      previousEnabled: current.enabled,
    },
  };
}

async function atomicReplace(configPath, serialized) {
  const directory = path.dirname(configPath);
  const temporaryPath = path.join(directory, `.${path.basename(configPath)}.${process.pid}.tmp`);
  try {
    await writeFile(temporaryPath, serialized, "utf8");
    await rename(temporaryPath, configPath);
  } catch (error) {
    try {
      await unlink(temporaryPath);
    } catch {
      // The temp file may already be gone after a successful rename.
    }
    throw error;
  }
}

function printHelp() {
  console.log(`Disable ${FLAG_KEY} without a code deployment.

Required flags:
  --config <path>       Flag configuration JSON to mutate atomically
  --actor <name>        Operator or system performing the rollback
  --reason <text>       Why the kill switch is being invoked
  --timestamp <value>   Caller-supplied timestamp for a deterministic audit

The command validates the document first. On success it writes enabled=false
with an empty allowlist via writeFile + rename, records previousRevision, and
prints a JSON audit to stdout.`);
}

async function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    fail(error.message);
  }

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  let configPath;
  let actor;
  let reason;
  let timestamp;
  try {
    for (const flag of REQUIRED_FLAGS) {
      if (process.argv.includes(flag) === false && args[flag.slice(2)] == null) {
        throw new Error(`Missing ${flag}`);
      }
    }
    configPath = path.resolve(requireNonEmpty("--config", args.config));
    actor = requireNonEmpty("--actor", args.actor);
    reason = requireNonEmpty("--reason", args.reason);
    timestamp = requireNonEmpty("--timestamp", args.timestamp);
  } catch (error) {
    fail(error.message);
  }

  let raw;
  try {
    raw = await readFile(configPath, "utf8");
  } catch {
    fail(`Cannot read config at ${configPath}`);
  }

  let current;
  try {
    current = validateConfigDocument(JSON.parse(raw));
  } catch (error) {
    fail(`Invalid config: ${error.message}`);
  }

  const rolledBack = buildRolledBackDocument(current, { actor, reason, timestamp });
  const serialized = `${JSON.stringify(rolledBack, null, 2)}\n`;
  const previousDigest = digest(raw);

  try {
    await atomicReplace(configPath, serialized);
  } catch (error) {
    fail(`Atomic write failed: ${error.message}`);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        flagKey: FLAG_KEY,
        enabled: false,
        configPath,
        previousRevision: rolledBack.previousRevision,
        revision: rolledBack.revision,
        previousDigest,
        afterDigest: digest(serialized),
        actor,
        reason,
        timestamp,
        command: "node scripts/rollback-invoice-preview.mjs --config <temporary-config> --actor --reason --timestamp",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => fail(error.message));

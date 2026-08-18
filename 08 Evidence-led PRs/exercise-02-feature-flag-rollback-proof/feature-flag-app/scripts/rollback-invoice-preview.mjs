#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const REQUIRED_FLAG_KEY = "invoice-preview-v2";
const REQUIRED_SCHEMA_VERSION = 1;

function argument(name) {
  const index = process.argv.indexOf(name);
  if (index === -1 || process.argv[index + 1] === undefined) {
    return undefined;
  }
  return process.argv[index + 1];
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

const configPath = argument("--config");
const actor = argument("--actor");
const reason = argument("--reason");
const timestamp = argument("--timestamp");

if (!configPath) {
  fail("Missing --config <path>");
}
if (actor === undefined) {
  fail("Missing --actor <value>");
}
if (reason === undefined) {
  fail("Missing --reason <value>");
}
if (timestamp === undefined) {
  fail("Missing --timestamp <ISO-8601>");
}

if (typeof actor !== "string" || actor.trim().length === 0) {
  fail("Actor must be a non-empty string");
}
if (typeof reason !== "string" || reason.trim().length === 0) {
  fail("Reason must be a non-empty string");
}

if (Number.isNaN(Date.parse(timestamp))) {
  fail("Timestamp must be a valid ISO-8601 value");
}

if (!fs.existsSync(configPath)) {
  fail(`Configuration file not found: ${configPath}`);
}

let parsed;
try {
  parsed = JSON.parse(fs.readFileSync(configPath, "utf8"));
} catch {
  fail("Configuration is not valid JSON");
}

if (parsed.schemaVersion !== REQUIRED_SCHEMA_VERSION) {
  fail(`Configuration schemaVersion must be ${REQUIRED_SCHEMA_VERSION}`);
}
if (parsed.flagKey !== REQUIRED_FLAG_KEY) {
  fail(`Configuration flagKey must be ${REQUIRED_FLAG_KEY}`);
}

const previousRevision = parsed.revision;
const updated = {
  ...parsed,
  enabled: false,
  allowlist: [],
  revision: `rollback-${timestamp.replaceAll(":", "-").replaceAll(".", "-")}`,
  lastRollback: {
    actor,
    reason,
    timestamp,
    previousRevision,
  },
};

const directory = path.dirname(configPath);
const temporaryPath = path.join(directory, `.invoice-preview-rollback-${process.pid}.tmp`);
const formatted = `${JSON.stringify(updated, null, 2)}\n`;

try {
  fs.writeFileSync(temporaryPath, formatted);
  fs.renameSync(temporaryPath, configPath);
} catch (error) {
  try {
    fs.unlinkSync(temporaryPath);
  } catch {
    // Best-effort cleanup of the sibling temporary file.
  }
  fail(`Failed to write configuration atomically: ${error.message}`);
}

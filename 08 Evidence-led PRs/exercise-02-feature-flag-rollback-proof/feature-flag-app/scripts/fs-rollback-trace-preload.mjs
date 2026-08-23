import fs from "node:fs";
import path from "node:path";
import { syncBuiltinESMExports } from "node:module";

const output = process.env.ROLLBACK_TRACE_OUTPUT;
const target = process.env.ROLLBACK_TRACE_CONFIG ? path.resolve(process.env.ROLLBACK_TRACE_CONFIG) : null;
const original = {
  openSync: fs.openSync,
  readFileSync: fs.readFileSync,
  writeFileSync: fs.writeFileSync,
  renameSync: fs.renameSync,
  unlinkSync: fs.unlinkSync,
  closeSync: fs.closeSync,
  promises: {
    open: fs.promises.open.bind(fs.promises),
    readFile: fs.promises.readFile.bind(fs.promises),
    writeFile: fs.promises.writeFile.bind(fs.promises),
    rename: fs.promises.rename.bind(fs.promises),
    unlink: fs.promises.unlink.bind(fs.promises),
  },
};

function relevant(value) {
  if (!target || typeof value !== "string") return false;
  const absolute = path.resolve(value);
  return absolute === target || path.dirname(absolute) === path.dirname(target) && path.basename(absolute).startsWith(`${path.basename(target)}.`) || absolute === `${target}.lock`;
}

function record(operation, details = {}) {
  if (!output) return;
  original.writeFileSync(output, `${JSON.stringify({ operation, ...details })}\n`, { flag: "a" });
}

function isExclusive(flags) {
  if (typeof flags === "number") return (flags & fs.constants.O_EXCL) === fs.constants.O_EXCL;
  return String(flags ?? "").includes("x");
}

function holdLockIfRequested(file, flags) {
  if (!relevant(String(file)) || !isExclusive(flags)) return;
  const milliseconds = Number(process.env.ROLLBACK_TRACE_HOLD_LOCK_MS ?? 0);
  if (milliseconds > 0) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

fs.openSync = function tracedOpen(file, flags, ...rest) {
  if (relevant(String(file))) record("open", { path: path.resolve(String(file)), flags: String(flags), exclusive: isExclusive(flags) });
  const descriptor = original.openSync.call(fs, file, flags, ...rest);
  holdLockIfRequested(file, flags);
  return descriptor;
};
fs.readFileSync = function tracedRead(file, ...rest) {
  if (relevant(String(file))) record("read", { path: path.resolve(String(file)) });
  return original.readFileSync.call(fs, file, ...rest);
};
fs.writeFileSync = function tracedWrite(file, ...rest) {
  const options = rest[rest.length - 1];
  const flags = typeof options === "object" && options !== null ? options.flag : undefined;
  if (relevant(String(file))) record("write", { path: path.resolve(String(file)), exclusive: isExclusive(flags) });
  const result = original.writeFileSync.call(fs, file, ...rest);
  holdLockIfRequested(file, flags);
  return result;
};
fs.renameSync = function tracedRename(from, to, ...rest) {
  if (relevant(String(from)) || relevant(String(to))) record("rename", { from: path.resolve(String(from)), to: path.resolve(String(to)) });
  return original.renameSync.call(fs, from, to, ...rest);
};
fs.unlinkSync = function tracedUnlink(file, ...rest) {
  if (relevant(String(file))) record("unlink", { path: path.resolve(String(file)) });
  return original.unlinkSync.call(fs, file, ...rest);
};
fs.closeSync = function tracedClose(descriptor, ...rest) {
  return original.closeSync.call(fs, descriptor, ...rest);
};
fs.promises.open = async function tracedOpen(file, flags, ...rest) {
  if (relevant(String(file))) record("open", { path: path.resolve(String(file)), flags: String(flags), exclusive: isExclusive(flags) });
  const handle = await original.promises.open(file, flags, ...rest);
  holdLockIfRequested(file, flags);
  return handle;
};
fs.promises.readFile = async function tracedRead(file, ...rest) {
  if (relevant(String(file))) record("read", { path: path.resolve(String(file)) });
  return original.promises.readFile(file, ...rest);
};
fs.promises.writeFile = async function tracedWrite(file, ...rest) {
  const options = rest[rest.length - 1];
  const flags = typeof options === "object" && options !== null ? options.flag : undefined;
  if (relevant(String(file))) record("write", { path: path.resolve(String(file)), exclusive: isExclusive(flags) });
  const result = await original.promises.writeFile(file, ...rest);
  holdLockIfRequested(file, flags);
  return result;
};
fs.promises.rename = async function tracedRename(from, to, ...rest) {
  if (relevant(String(from)) || relevant(String(to))) record("rename", { from: path.resolve(String(from)), to: path.resolve(String(to)) });
  return original.promises.rename(from, to, ...rest);
};
fs.promises.unlink = async function tracedUnlink(file, ...rest) {
  if (relevant(String(file))) record("unlink", { path: path.resolve(String(file)) });
  return original.promises.unlink(file, ...rest);
};

syncBuiltinESMExports();

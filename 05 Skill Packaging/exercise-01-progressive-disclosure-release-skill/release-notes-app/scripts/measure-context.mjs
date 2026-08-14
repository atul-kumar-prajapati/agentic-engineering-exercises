import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export function measureContext(inputPaths, cwd = process.cwd()) {
  if (!inputPaths.length) throw new Error("Provide at least one context file.");
  const exerciseRoot = path.resolve(cwd, "..");
  const files = inputPaths.map((input) => {
    const absolute = path.resolve(cwd, input);
    if (!(absolute === exerciseRoot || absolute.startsWith(exerciseRoot + path.sep))) throw new Error(`${input} is outside this exercise.`);
    if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) throw new Error(`${input} is not a readable file.`);
    return {
      file: path.relative(cwd, absolute).replaceAll(path.sep, "/"),
      bytes: Buffer.byteLength(fs.readFileSync(absolute, "utf8"), "utf8"),
    };
  });
  return { files, total_context_bytes: files.reduce((sum, item) => sum + item.bytes, 0) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    console.log(JSON.stringify(measureContext(process.argv.slice(2)), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

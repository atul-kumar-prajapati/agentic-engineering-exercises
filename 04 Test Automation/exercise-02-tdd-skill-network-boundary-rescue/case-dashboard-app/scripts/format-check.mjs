import fs from "node:fs";
import path from "node:path";

const roots = ["src", "scripts"];
const failures = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    if (entry.isFile() && /\.(ts|tsx|mjs|json)$/.test(entry.name)) {
      const lines = fs.readFileSync(full, "utf8").split(/\r?\n/);
      lines.forEach((line, index) => {
        if (/\s+$/.test(line)) failures.push(`${full}:${index + 1} trailing whitespace`);
      });
    }
  }
}

roots.forEach(walk);

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("format-check passed");

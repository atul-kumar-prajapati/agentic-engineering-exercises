import fs from "node:fs";
import path from "node:path";

const src = path.join(process.cwd(), "src");
const failures = [];
function walkDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkDir(full);
    if (entry.isFile() && /\.tsx?$/.test(entry.name)) {
      const text = fs.readFileSync(full, "utf8");
      if (/from ["'][^"']+\.(jsx|js)["']/.test(text)) failures.push(path.relative(process.cwd(), full) + " imports a stale JS extension");
    }
  }
}
walkDir(src);
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log("starter-check passed");

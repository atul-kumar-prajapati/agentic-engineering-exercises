import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillsRoot = path.join(root, "skills");
const catalog = [];

for (const entry of await readdir(skillsRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const skillPath = path.join(skillsRoot, entry.name, "SKILL.md");
  const source = await readFile(skillPath, "utf8");
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) throw new Error(`${skillPath} has no YAML frontmatter`);
  const values = Object.fromEntries(frontmatter[1].split(/\r?\n/).map((line) => {
    const separator = line.indexOf(":");
    return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
  }));
  if (!values.name || !values.description) throw new Error(`${skillPath} must declare name and description`);
  catalog.push({ name: values.name, description: values.description, source: path.relative(root, skillPath).replaceAll("\\", "/") });
}

catalog.sort((left, right) => left.name.localeCompare(right.name));
await mkdir(path.join(root, "generated"), { recursive: true });
await writeFile(path.join(root, "generated", "skill-catalog.json"), `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Built catalog from ${catalog.length} real SKILL.md files.`);

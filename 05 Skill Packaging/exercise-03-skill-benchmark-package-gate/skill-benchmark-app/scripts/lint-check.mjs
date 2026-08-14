import fs from "node:fs";

const source = fs.readFileSync("src/labContract.ts", "utf8");
const failures = [];

for (const phrase of ["generic workflow queue", "placeholder", "TODO:"]) {
  if (source.toLowerCase().includes(phrase.toLowerCase())) {
    failures.push(`lab contract contains weak phrase: ${phrase}`);
  }
}

if (!source.includes("skillPattern")) {
  failures.push("lab contract must expose the skillPattern field");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("lint-check passed");

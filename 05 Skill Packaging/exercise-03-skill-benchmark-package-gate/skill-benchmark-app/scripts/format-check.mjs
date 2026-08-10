import fs from "node:fs";
import path from "node:path";

const files = ["package.json", "lab-contract.json", "tsconfig.json"];
const failures = [];

for (const file of files) {
  try {
    JSON.parse(fs.readFileSync(path.join(process.cwd(), file), "utf8"));
  } catch (error) {
    failures.push(`${file} is not valid JSON: ${error.message}`);
  }
}

const readme = fs.readFileSync(path.join(process.cwd(), "..", "README.md"), "utf8");
const requiredSections = ["## Your Mission", "## Project", "## How To Go About It", "## Evidence"];
const missingSections = requiredSections.filter((section) => !readme.includes(section));
if (missingSections.length) {
  failures.push("README is missing required exercise sections: " + missingSections.join(", "));
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("format-check passed");

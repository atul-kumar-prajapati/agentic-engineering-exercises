import fs from "node:fs";
import { chromium } from "@playwright/test";

const [major, minor] = process.versions.node.split(".").map(Number);
const supportedNode = major > 22 || (major === 22 && minor >= 12);

if (!supportedNode || major >= 25) {
  console.error(`Unsupported Node.js ${process.versions.node}. Use Node.js 22.12 through 24.`);
  process.exit(1);
}

const executable = chromium.executablePath();
if (!fs.existsSync(executable)) {
  console.error("Playwright Chromium is not installed. Run: npm run setup:browser");
  process.exit(1);
}

console.log(`Node.js ${process.versions.node}: ready`);
console.log(`Playwright Chromium: ${executable}`);
console.log("Local setup is ready. The starter browser smoke test runs next.");

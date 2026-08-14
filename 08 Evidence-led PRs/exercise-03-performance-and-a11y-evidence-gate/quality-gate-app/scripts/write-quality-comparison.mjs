import fs from "node:fs";
import path from "node:path";
import { renderComparison } from "./quality-verification.mjs";

function argument(name) {
  const index = process.argv.indexOf(name);
  if (index === -1 || !process.argv[index + 1]) throw new Error(`Missing ${name}`);
  return process.argv[index + 1];
}

const summary = JSON.parse(fs.readFileSync(path.resolve(argument("--summary")), "utf8"));
const baselineLighthouse = JSON.parse(fs.readFileSync(path.resolve("../fixtures/lighthouse-before.json"), "utf8"));
const baselineAxe = JSON.parse(fs.readFileSync(path.resolve("../fixtures/a11y-before.json"), "utf8"));
const output = path.resolve(argument("--output"));
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, renderComparison(summary, baselineLighthouse, baselineAxe));
console.log(`PASS wrote reviewer comparison for ${summary.sourceSha}`);

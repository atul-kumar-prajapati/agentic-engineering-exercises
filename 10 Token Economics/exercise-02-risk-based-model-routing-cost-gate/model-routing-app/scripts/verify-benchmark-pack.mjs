import fs from "node:fs";
import path from "node:path";

const exerciseRoot = path.resolve(import.meta.dirname, "..", "..");
const pack = JSON.parse(fs.readFileSync(path.join(exerciseRoot, "evals", "recorded-runs.json"), "utf8"));
if (pack.sourceKind !== "deterministic-benchmark-fixture" || !String(pack.provenance?.limitations).includes("not production-provider telemetry")) {
  throw new Error("benchmark fixture must state its synthetic provenance and limitations");
}
if (!Array.isArray(pack.runs) || pack.runs.length !== 36) throw new Error("benchmark fixture must contain 36 fixed observations");
console.log("PASS protected benchmark fixture is explicit, offline, and reproducible");

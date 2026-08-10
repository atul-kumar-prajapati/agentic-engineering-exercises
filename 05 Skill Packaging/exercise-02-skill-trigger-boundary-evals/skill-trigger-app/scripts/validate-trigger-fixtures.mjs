import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("evals/trigger-evals.json", "utf8"));
if (data.skill_name !== "change-review" || !Array.isArray(data.cases)) throw new Error("invalid trigger eval file");
if (data.cases.length !== 20) throw new Error(`expected 20 cases, found ${data.cases.length}`);
const ids = new Set(data.cases.map((item) => item.id));
if (ids.size !== data.cases.length) throw new Error("trigger case IDs must be unique");
for (const split of ["train", "held-out"]) {
  const cases = data.cases.filter((item) => item.split === split);
  if (cases.length < 8) throw new Error(`${split} needs at least eight cases`);
  if (!cases.some((item) => item.expected) || !cases.some((item) => !item.expected)) throw new Error(`${split} needs positive and negative cases`);
}
console.log("Trigger fixtures contain 20 unique positive and negative train/held-out requests.");

import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("evals/evals.json", "utf8"));
if (data.skill_name !== "incident-summary" || data.evals?.length !== 4) throw new Error("expected four incident-summary evals");
for (const split of ["train", "held-out"]) if (data.evals.filter((item) => item.split === split).length !== 2) throw new Error(`expected two ${split} evals`);
for (const item of data.evals) {
  if (!item.prompt || !item.files?.length || item.expectations?.length < 3) throw new Error(`eval ${item.id} is incomplete`);
  if (!item.expectations.some((expectation) => expectation.critical)) throw new Error(`eval ${item.id} needs a critical assertion`);
  for (const relative of item.files) if (!fs.existsSync(relative)) throw new Error(`missing ${relative}`);
}
console.log("Benchmark fixtures contain four realistic train/held-out tasks with critical assertions.");

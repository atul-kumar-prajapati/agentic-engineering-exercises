import { readFileSync } from "node:fs";

const casesUrl = new URL("./eval/cases.json", import.meta.url);
const cases = JSON.parse(readFileSync(casesUrl, "utf8"));
const baseline = readFileSync(new URL("./eval/review-prompt-before.md", import.meta.url), "utf8");
const candidate = readFileSync(new URL("./eval/review-prompt-candidate.md", import.meta.url), "utf8");
const provider = process.env.REVIEW_EVAL_MODEL;
if (!provider) throw new Error("Set REVIEW_EVAL_MODEL to a real remote Promptfoo provider before eval:model");

const prompts = [
  { label: "baseline", raw: `${baseline}\n\nAcceptance context:\n{{context}}\n\nDiff:\n{{diff}}` },
  { label: "candidate", raw: `${candidate}\n\nAcceptance context:\n{{context}}\n\nDiff:\n{{diff}}` },
];

export default {
  description: "Uncached code-review regression gate",
  prompts,
  providers: [{ id: provider, config: { temperature: 0 } }],
  tests: cases.flatMap((testCase, caseIndex) => [1, 2, 3].map((sample) => ({
    description: `case-${caseIndex + 1}-sample-${sample}`,
    vars: { context: testCase.publicContext, diff: readFileSync(new URL(testCase.diff, casesUrl), "utf8") },
    metadata: { caseId: testCase.id, kind: testCase.kind, sample },
  }))),
};

import { readFileSync } from "node:fs";

const casesUrl = new URL("./eval/cases.json", import.meta.url);
const cases = JSON.parse(readFileSync(casesUrl, "utf8"));
const candidate = readFileSync(new URL("./eval/review-prompt-candidate.md", import.meta.url), "utf8");
const provider = process.env.REVIEW_EVAL_MODEL || "openai:chat:gpt-4.1-mini";

export default {
  description: "Behavior-based code-review regression evaluation",
  prompts: [`${candidate}\n\nContext: {{context}}\n\nDiff:\n{{diff}}`],
  providers: [{ id: provider, config: { temperature: 0 } }],
  tests: cases.map((testCase) => ({
    description: testCase.id,
    vars: { context: `${testCase.id} (${testCase.kind})`, diff: readFileSync(new URL(testCase.diff, casesUrl), "utf8") },
    assert: [{ type: "llm-rubric", value: testCase.rubric }],
    metadata: { kind: testCase.kind },
  })),
};

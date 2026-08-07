import { readFileSync } from "node:fs";

const catalog = JSON.parse(readFileSync(new URL("./generated/skill-catalog.json", import.meta.url), "utf8"));
const cases = JSON.parse(readFileSync(new URL("./eval/cases.json", import.meta.url), "utf8"));
const provider = process.env.SKILL_EVAL_MODEL || "openai:chat:gpt-4.1-mini";

export default {
  description: "Sampled model evaluation against real skill metadata",
  prompts: [
    `You select at most one agent skill. Return only its name, or NONE when no skill clearly fits or the request requires multiple skills.\n\nSkills:\n${catalog.map((skill) => `- ${skill.name}: ${skill.description}`).join("\n")}\n\nRequest: {{request}}`,
  ],
  providers: [{ id: provider, config: { temperature: 0 } }],
  tests: cases.map((testCase) => ({ vars: { request: testCase.request }, assert: [{ type: "equals", value: testCase.expected }] })),
};

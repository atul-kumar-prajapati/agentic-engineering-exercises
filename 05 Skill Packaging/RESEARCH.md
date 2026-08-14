# Skill Packaging Research Basis

These exercises follow the open [Agent Skills specification](https://agentskills.io/specification) and the official [Anthropic skill-creator workflow](https://github.com/anthropics/skills/tree/main/skills/skill-creator).

The section teaches three practices in order:

1. Package a skill with required `SKILL.md` metadata and optional `scripts/`, `references/`, `assets/`, and `evals/` resources. Keep the main instructions concise and load detailed resources only when needed.
2. Treat the `description` as a routing boundary. Test substantive should-trigger and should-not-trigger requests, use held-out cases, repeat sampled decisions, and select changes by held-out performance.
3. Compare baseline and with-skill task runs using verifiable assertions, repeated samples, quality, variance, token use, and elapsed time before creating a distributable `.skill` archive.

The exercises use `skill-creator` because its public workflow covers skill anatomy, eval schemas, trigger optimization with train and held-out splits, repeated runs, benchmark analysis, and packaging. The domain fixtures remain local so participants can prove results without changing source evidence.

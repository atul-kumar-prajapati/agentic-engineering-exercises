# Benchmark Gate

A skill may be packaged only when all common checks and one comparison mode pass.

## Common checks

- all four evals have three `without_skill`, three `starter_skill`, and three `with_skill` first-attempt runs;
- the agent, model, tools, permissions, repository commit, and time limit match across corresponding runs;
- held-out assertion pass rate is at least 87.5 percent;
- every critical held-out assertion passes in all final runs;
- held-out run-to-run pass-rate standard deviation is at most 0.16;
- final mean token use is at most 1.5 times the no-skill lane;
- final mean elapsed time is at most 2 times the no-skill lane;
- expected source IDs, fixture facts, and eval wording are absent from the skill;
- the archive contains exactly the evaluated skill files and passes path-safety checks.

## Comparison modes

Use the normal quality-improvement mode when both baselines are below 95 percent. The candidate must improve held-out quality by at least 10 percentage points over each baseline.

Use ceiling-aware mode when either baseline is at least 95 percent. Compare against the stronger baseline. The candidate must not reduce held-out quality or critical accuracy and must show at least one measurable improvement:

- at least 15 percent fewer mean tokens;
- at least 15 percent lower mean elapsed time; or
- held-out pass-rate standard deviation lower by at least 0.02.

If a common check fails, revise the candidate and rerun the complete benchmark. If all common checks pass but the applicable comparison mode fails, the correct decision is `reject`. Do not create or submit an archive for a rejected candidate.

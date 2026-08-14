# Benchmark Gate

A skill may be packaged only when:

- all four evals have three `without_skill`, three `starter_skill`, and three `with_skill` first-attempt runs;
- the agent, model, tools, permissions, repository commit, and time limit match across corresponding runs;
- held-out assertion pass rate is at least 87.5 percent and improves by at least 10 percentage points over both comparison lanes;
- every critical held-out assertion passes in all final runs;
- held-out run-to-run pass-rate standard deviation is at most 0.16;
- final mean token use is at most 1.5 times the no-skill lane;
- final mean elapsed time is at most 2 times the no-skill lane;
- expected source IDs, fixture facts, and eval wording are absent from the skill;
- the archive contains exactly the evaluated skill files and passes path-safety checks.

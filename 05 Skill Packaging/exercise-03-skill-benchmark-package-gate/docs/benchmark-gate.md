# Benchmark Gate

A skill may be packaged only when:

- every eval has three baseline and three with-skill runs;
- held-out assertion pass rate improves over baseline;
- no critical assertion has a lower pass rate with the skill;
- quality, variance, input/output tokens, and elapsed time are reported;
- expected answers are not copied into `SKILL.md`;
- the selected package contains the exact evaluated skill version.

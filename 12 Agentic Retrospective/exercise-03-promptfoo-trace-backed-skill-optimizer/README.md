# Exercise 03 : Promptfoo Trace-Backed Skill Optimizer

## Your Mission

Your mission is to optimize a skill using trace evidence and a small evaluation set.

You are given a repository with failed agent traces and a skill that produces inconsistent results.

The duration for this challenge is 30 min or less.

## Project

[skill-optimizer-app](./skill-optimizer-app) contains the skill optimizer workflow for this exercise.

## How To Go About It

Use [Promptfoo](https://www.promptfoo.dev/docs/intro/) to measure the skill change against trace-backed cases.

Ask your coding agent to inspect `skill-optimizer-app/`, build the trace eval, revise the skill, and verify before/after results.

## Evidence

Produce the trace cases, improved skill, before/after results, and verification notes.

Raise the completed work as a PR for getting verified with our team.


## Required Implementation Changes

Complete the mission and deliverables described above against the supplied starter. Keep the named workflow working and address the stated exercise problem instead of replacing it with an unrelated example.

## Allowed Changes

Change files inside this exercise directory only. Do not edit another exercise, generated dependency directories, or repository-wide policy files. Keep unrelated starter behavior unchanged.

## Required Commands

In each supplied Node project, run `npm ci` followed by `npm run agent:check`. Run every additional exercise-specific verification command described above. Java projects must also run `./mvnw test` on macOS/Linux or `mvnw.cmd test` on Windows.

Use the versions declared in the repository root and follow the clean setup sequence in [the submission standard](../../docs/SUBMISSION_STANDARD.md).

## Acceptance Criteria

- All mission deliverables above are present and operate against the supplied starter.
- Required commands pass from a clean dependency installation.
- The change is limited to the stated exercise and preserves unrelated behavior.
- Claims in the submission can be traced to code, tests, generated artifacts, or command output.

## Evidence Contract

Add `evidence/README.md` containing each required command, its result, and links to the relevant output or artifact. Put requested reports, screenshots, traces, diagrams, or generated files under `evidence/`. Keep normal evidence below 10 MB and explain any larger trace or report.

## Incomplete When

The submission is incomplete if the starter no longer runs, a required command or deliverable is missing, evidence cannot be reproduced, expected output is self-declared instead of derived from the supplied input, or unrelated exercise files were changed.

## Evaluation Rubric

Use [the repository evaluation rules](../../docs/EVALUATION_RUBRICS.md). Score this exercise as 30 points for correct behavior, 25 for coverage of the mission deliverables, 20 for reproducible verification and evidence, 15 for scope control, and 10 for clear reasoning and maintainability.

# Exercise 05 : Graphify Codebase Graph to Diagrams

## Your Mission

Your mission is to convert codebase graph context into diagrams that guide a safe change.

You are given a repository where notification behavior crosses multiple modules and ownership boundaries.

The duration for this challenge is 30 min or less.

## Project

[notification-mesh-app](./notification-mesh-app) contains the notification workflow for this exercise.

## How To Go About It

Use [Graphify](https://github.com/Graphify-Labs/graphify) on the provided notification project.

Ask your coding agent to inspect `notification-mesh-app/`, create graph-backed diagrams, implement one safe notification change, and verify it.

## Evidence

Produce the graph notes, diagrams, safe notification change, and verification output.

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

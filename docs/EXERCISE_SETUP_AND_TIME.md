# Exercise Setup, Time, and External Runs

Use this guide before starting an exercise. Setup problems should not consume the challenge time or be confused with exercise difficulty.

## Time Meaning

The duration in each README is a target for active challenge work after dependencies, required tools, and the starter application are ready. The first attempt may take longer while learning the competency. Evidence preparation and external model queues also vary by environment.

## Base Setup

Unless the local README says otherwise, prepare:

- Git and a GitHub account able to create branches and pull requests.
- Node.js `22.12` to `24` and npm.
- A coding agent that can open the repository and report its model, tools, permissions, and run conditions.
- Dependencies installed with `npm ci` inside the exercise application.

Run the starter smoke or integrity command before timing the challenge. Use the exercise's `npm run verify:exercise` only after completing the work.

## Additional Prerequisites

| Exercise type | Prepare before timing |
|---|---|
| Browser and accessibility | Playwright Chromium and any named browser or MCP integration. Use the local setup check when supplied. |
| Semgrep review | Python 3 and Semgrep installed with `python -m pip install semgrep`; confirm with `semgrep --version`. |
| Java or full-stack provider | A supported JDK. Use the committed Maven wrapper rather than a separate Maven installation. |
| Multi-agent worktrees | Git worktree support and enough disk space for parallel working directories. |
| Diagram or knowledge-graph tools | The named service and its authentication when the tool is the competency being tested. |
| Model evaluation and benchmarking | Access to one fixed model/runtime, permission to record run metadata, and enough quota for every first-attempt run. |

A named tool is mandatory when the exercise compares behavior with and without that tool or skill. When the README asks only for an outcome and does not name a comparison variable, an equivalent tool is acceptable.

## Required Agent Sessions

Prepare the full session count before starting a multi-agent exercise. These are separate coding-agent sessions, not hidden API calls:

| Exercise | Minimum fresh sessions |
|---|---:|
| 6.1 Parallel Worktree Conflict Rescue | 3 implementation sessions, one per lane |
| 6.2 Specialist Review Merge Gate | 8 review-only sessions: 4 baseline reviews and 4 fresh rechecks |
| 9.3 Code Review Skill Hardening | 6 review sessions: 3 without the skill and 3 fresh sessions with the skill |

The integration owner checks and combines the outputs. Do not reuse one session across required lanes, specialists, or rechecks.

## Repeated Model Runs

Exercises with repeated agent decisions or benchmarks can require many calls. Read the run matrix before starting, calculate the required calls, and confirm quota and cost with your provider. Record the exact model, runtime, sampling settings or defaults, and raw result required by the local evidence template.

Provider queue and response time is not part of the active challenge target. Record the actual elapsed time because it is still part of the benchmark and completion effort.

| Exercise | Minimum measured model runs |
|---|---:|
| 5.2 Skill Trigger Boundary Evals | 120 decisions: 20 requests x 3 runs x before and after |
| 5.3 Skill Benchmark and Package Gate | 36 runs: 4 tasks x 3 lanes x 3 runs |
| 12.3 Trace-Backed Workflow Optimizer | 48 runs: 8 cases x 3 runs x baseline and candidate |

Estimate cost before starting from the provider's current input and output token rates. Use the largest allowed response and the full run count as the approval ceiling. The repository does not publish a fixed currency estimate because model prices and prompt sizes change.

Do not silently replace failed provider calls, selectively rerun weak results, or mix models. If the provider fails, record the failed run and restart the complete comparable set under one environment.

Exercises 9.3 and 10.2 do not make provider API calls during verification. Exercise 9.3 uses six interactive coding-agent sessions, and Exercise 10.2 uses a protected offline pack of 36 recorded measurements.

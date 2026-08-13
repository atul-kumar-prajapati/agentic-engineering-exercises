# Exercise 03 : Trace-Backed Workflow Optimizer

## Your Mission

Your mission is to improve reusable agent workflow instructions from repeated trace failures without overfitting to the supplied examples.

You are given traces where agents start editing before confirming scope, omit negative evidence, and claim completion from partial checks. The current workflow is polished but does not prevent those failures.

Measure the baseline, revise the workflow from failure clusters, and decide whether the new version should be adopted using held-out replays.

The duration for this challenge is 30 min or less.

## Project

[workflow-optimizer-app](./workflow-optimizer-app) contains the current workflow and protected train and held-out replay cases.

## How To Go About It

Run every case three times with the current workflow and record assertion evidence, model, tokens, and time. Cluster failures by root cause before editing instructions.

Revise general workflow behavior without copying case phrases or expected answers. Rerun the same lanes and select the new workflow only if held-out quality improves with no critical regression or unreasonable context increase.

## Evidence

Submit the revised workflow, raw baseline and candidate runs, `evidence/failure-clusters.md`, `evidence/benchmark.json`, and `evidence/adoption.md` with quality, variance, cost, and limitations.

Run `npm run eval:fixtures`, `npm run test:submission`, and `npm run agent:check` from `workflow-optimizer-app`.

Raise a focused PR containing only this exercise. Follow the [submission standard](../../docs/SUBMISSION_STANDARD.md).

## Evaluation

Reviewers will check trace-backed clusters, three runs per lane, held-out improvement, critical assertions, token and time reporting, general instructions, and an evidence-based adoption decision.

The exercise is incomplete if only the best run is shown, expected answers leak into instructions, held-out cases change, or polished output replaces measured improvement.

See the [Trace-Backed Workflow Optimizer rubric](../../docs/EVALUATION_RUBRICS.md#trace-backed-workflow-optimizer).

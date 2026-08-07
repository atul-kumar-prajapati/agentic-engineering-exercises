# Exercise 02: Specialist Subagent NFR Review

## Objective

Run security, accessibility, performance, and testability reviews against the mounted access-review workflow, integrate selected fixes, and recheck the final code.

## Starting Point

The workflow contains deliberate risk: reviewer HTML rendering, non-keyboard queue rows, expensive render work, and a server-simulation policy that trusts the UI. Shared report and decision templates plus a baseline measurement command are supplied.

## Required Implementation Changes

- Give each specialist the same commit SHA and report schema.
- Require exact file/line and reproduction evidence for every finding.
- Include keyboard or assistive-technology evidence for accessibility.
- Record comparable before and after performance measurements.
- Triage every finding as fix, defer, or dismiss with owner and residual risk.
- Re-run affected specialist reviews after fixes are integrated.

## Allowed Changes

Change the access-review workflow, focused tests, specialist reports, decision log, and evidence. Do not replace the workflow with the generic lab screen or remove risky behavior without recording the finding and decision.

## Required Commands

Use the supported versions and clean-install sequence in [the submission standard](../../docs/SUBMISSION_STANDARD.md).

From `nfr-swarm-app`:

```text
npm ci
npm run measure:baseline
npm run agent:check
```

Add and record focused commands for every implemented fix, then rerun affected specialists on the final SHA.

## Acceptance Criteria

- Four specialist reports use the shared schema and severity calibration.
- Findings describe the final submitted code or clearly identify pre-fix evidence.
- Performance and accessibility claims have the required measurements.
- The server authorization/evidence boundary is reviewed.
- The decision log records owner, rationale, evidence, trigger, and residual risk.

## Evidence Contract

Commit reports under `evidence/specialists/`, the completed decision log, before/after performance JSON, accessibility evidence, final SHA, and final check output.

## Incomplete When

Reports review different unexplained SHAs, findings lack evidence, performance is subjective, keyboard behavior is not exercised, triage decisions lack owners, or no final-state recheck occurs.

## Evaluation Rubric

See [Specialist NFR Review](../../docs/EVALUATION_RUBRICS.md#specialist-nfr-review).

# Exercise Repository Improvement Plan

## Purpose

This document captures the most important, actionable feedback shortlisted from the 15 exercise review reports. It excludes general praise, personal preferences, individual difficulty ratings, and suggestions that only apply to the person who completed the exercises.

The goal is to give a developer enough detail to improve the repository without needing to read the original reports.

## Priority definitions

- **P0 - Fix first:** The current starter, input, or review target does not match the exercise description. This can prevent a participant from completing the intended task.
- **P1 - High value:** The exercise can be completed, but important requirements, proof, or evaluation criteria are missing.
- **P2 - Useful follow-up:** This improves depth or realism after the core exercise is corrected.

## Repository-wide improvements

### 1. Make every starter project match its exercise brief

**Priority:** P0

Several exercises describe a workflow, defect, or review target that is not present in the supplied starter. Participants then have to build or reconstruct the exercise before they can solve it.

**Required change**

- Verify that every workflow named in an exercise README is mounted and runnable.
- Seed the exact weakness that the participant is expected to identify or fix.
- Add a smoke check that fails if the starter and README drift apart.
- Avoid using generic lab-contract screens when the exercise describes a specific product workflow.

**Example**

The Playwright exercise should start with a working checkout flow containing an unstable selector, a fixed wait, and a shared payment mock. It should not start with an unrelated static dashboard.

**Done when**

- A maintainer can follow the README and reproduce the intended starting problem.
- The starter can be installed and launched without adding missing product functionality.
- At least one automated check confirms that the named workflow is reachable.

### 2. Add an acceptance and evidence contract to every README

**Priority:** P1

Participants and reviewers need to know exactly what must be delivered and how completion will be verified.

**Required change**

Add the following sections to every exercise:

1. Required implementation changes.
2. Files or areas that may be changed.
3. Commands that must pass.
4. Required evidence and where to place it.
5. Conditions that make the submission incomplete.

**Example evidence contract**

- Test output from the required command.
- A repeated or clean-process run when stability matters.
- A trace, screenshot, report, or generated artifact when requested by the exercise.
- A short explanation connecting the evidence to the requirement.

**Done when**

- Two reviewers can independently reach the same completion decision.
- Evidence paths, formats, and size expectations are stated in the README.

### 3. Use real exercise inputs instead of self-declared fixtures

**Priority:** P0

Exercises that involve diffs, commits, skills, migrations, or reviews should provide the actual input being evaluated. A fixture that declares both the source and expected answer can verify itself without testing the intended skill.

**Required change**

- Include real commits, patches, branches, components, skill files, or work items.
- Make the expected comparison range reproducible.
- Keep expected answers outside the participant input.
- Verify submitted output against the real source artifact.

**Done when**

- A reviewer can independently inspect the original input.
- Changing the real input can cause the participant's verification to fail.

### 4. Make the toolchain reproducible

**Priority:** P1

Short exercises should measure the target competency rather than dependency or environment troubleshooting.

**Required change**

- Declare the supported Node and Java versions.
- Commit dependency lockfiles.
- Include a Maven wrapper for Java exercises.
- Document browser installation where Playwright is used.
- Provide one clean installation and verification sequence.

**Done when**

- The exercise passes from a clean checkout using the documented versions and commands.

## Exercise-specific improvements

## 01 Toolchain Setup

### Exercise 1: Agent Onboarding Kit

#### Add a second-stage prove-it-works task

**Priority:** P1

The onboarding documents can be complete and well written without proving that a fresh agent can use them correctly.

**Required change**

After the onboarding files are submitted, give a fresh agent a small repository change. The agent may use only the repository and the submitted onboarding guidance.

**Example follow-up task**

Change one routing rule that exists in two policy locations, update representative sample data, run the correct checks, and prepare a focused patch.

**Evaluate whether the fresh agent**

- Edits the correct ownership boundaries.
- Updates all duplicated policy locations.
- Avoids unrelated files.
- Runs the repository's required checks.
- Produces a focused, reviewable change.

**Done when**

- The exercise includes a follow-up task brief.
- The repository captures the fresh agent's result and verification output.

### Exercise 2: Agent Guardrails

#### Add executable allowed-versus-blocked action tests

**Priority:** P1

Written guardrails describe intent, but they do not prove that the agent platform, sandbox, CI, or operating system enforces the restrictions.

**Required change**

Create a test matrix with allowed, denied, read-only, and approval-required actions.

**Minimum scenarios**

- Reading normal source files is allowed.
- Editing an owned application file is allowed.
- Running the standard test command is allowed.
- Reading secrets or environment files is blocked.
- Editing production configuration is blocked or requires approval.
- Running destructive database, migration, or release commands is blocked or requires approval.
- Path traversal, symlink, and prompt-injection bypass attempts are rejected.
- Blocked attempts are recorded in an audit log.

**Done when**

- The policy tests are executable with one documented command.
- Evidence distinguishes documented rules from controls that are actually enforced.
- A deliberately weakened guardrail causes the test suite to fail.

## 02 Spec Framing

### Exercise 1: Spec-Driven Feature Development

#### Require clarification questions and explicit assumptions before the specification

**Priority:** P1

The current workflow can reward filling a template without demonstrating how the participant handles missing or conflicting requirements.

**Required change**

Before writing the specification, require the participant to provide three to five important clarification questions. If an answer is unavailable, the participant must state the assumption and explain its consequence.

**Example**

- Question: Who is allowed to change a subscription plan?
- Assumption: Only organization administrators can change it.
- Consequence: The specification requires an authorization check and an unauthorized state.

**Done when**

- The clarification and assumption section is mandatory.
- Important billing, authorization, failure-state, and scope boundaries cannot be silently invented.

## 04 Test Automation

### Exercise 1: Playwright MCP Checkout Rescue

#### Repair the starter and seed a reproducible flaky checkout

**Priority:** P0

**Required change**

- Ship a working checkout with cart, tax quote, payment authorization, confirmation, and decline recovery.
- Seed a real fixed wait, an unstable generated-class selector, and payment-mock state that leaks between tests.
- Provide a command such as `npx playwright test --repeat-each=20 --workers=2` that reproduces the failure often enough to investigate.
- Specify whether the submission must include `trace.zip`, an HTML report, a screenshot, console output, or a defined subset.

**Done when**

- The failure is observable before the fix and stable after the fix.
- The participant does not need to invent the checkout application.

### Exercise 2: MSW Component Network Boundary Tests

#### Supply a real network-backed dashboard and precise state requirements

**Priority:** P0

**Required change**

- Mount the case dashboard in the starter.
- Make it request `GET /api/cases`.
- Include MSW and one intentionally weak component test.
- Require distinct messages for server-empty and filter-empty states.
- Require a visible retry action, strict unhandled-request behavior, and handler reset after each test.
- Pin the Node version, dependencies, and Playwright browser setup.

**Done when**

- Participants improve the network tests instead of building the missing dashboard.
- Loading, success, server-empty, filtered-empty, error, and retry states have explicit acceptance criteria.

### Exercise 3: Pact Workflow Contract Gate

#### Provide a runnable contract scaffold and one complete gate

**Priority:** P1

**Required change**

- Include pinned dependencies, a Maven wrapper, and one failing consumer contract skeleton.
- Name the required interactions, such as workflow listing and decision submission.
- Name the required provider states.
- Provide one command or script that generates the Pact and verifies it against the provider.

**Done when**

- A clean checkout can run the complete consumer and provider gate.
- The participant spends the timebox designing the contract rather than assembling both toolchains.

## 05 Skill Packaging

### Exercise 1: Release Notes Agent Skill Factory

#### Generate release notes from a real repository change

**Priority:** P0

**Required change**

- Provide messy commits, PR descriptions, a real compare range, and partial CI evidence.
- Require the skill to trace each release-note entry to real changed files or commits.
- Specify the skill location, input schema, publication rules, and trigger and non-trigger cases.

**Done when**

- The verifier reads the changed-file list from Git instead of from the same fixture that contains the expected notes.
- Internal-only changes, breaking changes, missing evidence, rollout, and rollback requirements are tested against real input.

### Exercise 2: jscodeshift Migration Playbook Skill

#### Include a genuine legacy component and a bounded migration contract

**Priority:** P0

**Required change**

- Supply an actual legacy component and name the first migration target.
- Include an input fixture, expected output fixture, and one intentionally failing fixture.
- State the allowed files and behavior invariants.
- Require dry-run output, idempotence, component behavior tests, and rollback notes.

**Done when**

- The codemod transforms a real legacy pattern rather than making a cosmetic change to an already modern component.
- Running the codemod twice produces no additional changes.
- An unrelated component remains unchanged.

### Exercise 3: Promptfoo Skill Trigger Eval Harness

#### Evaluate the actual overlapping skill definitions

**Priority:** P0

**Required change**

- Ship multiple overlapping candidate `SKILL.md` files.
- Build the evaluation catalog from the real skill metadata rather than a manually duplicated JSON file.
- Keep a deterministic local evaluation for fast checks.
- Add a sampled evaluation using the model intended for real skill selection.
- Include paraphrased, noisy, compound, and ambiguous requests.

**Done when**

- Editing an actual skill description changes the evaluation result.
- The report includes trigger precision, recall, confusion cases, and the threshold for human review.
- Expected answers are not encoded in the provider logic.

## 06 Multi-Agent Workflows

### Exercise 1: Parallel Worktree Feature Split

#### Define the product work and require verifiable lane handoffs

**Priority:** P1

**Required change**

- State the three product improvements explicitly.
- Give each lane an ownership boundary and focused verification command.
- Require every lane handoff to include the base SHA, branch, owned paths, command, result, commit SHA, and rollback note.
- Ensure the lane branches or commits are available to reviewers.
- Include one controlled shared-file conflict that must be resolved and documented.

**Done when**

- Reviewers can inspect the original lane commits, not only the cherry-picked result.
- The ownership map, worktree log, and Git history agree.

### Exercise 2: Specialist Subagent NFR Review

#### Standardize specialist evidence and review the final integrated application

**Priority:** P0

**Required change**

- Mount the intended workflow in the starter.
- Give security, accessibility, performance, and testability reviewers one shared report schema.
- Include a severity calibration example and require exact evidence for each finding.
- Require before-and-after measurements for performance findings.
- Require keyboard or assistive-technology evidence for accessibility findings.
- Re-run relevant specialist reviews after the selected fixes are integrated.

**Done when**

- Specialist reports describe the final submitted code rather than a pre-integration version.
- The fix, defer, or dismiss decision log includes the owner, rationale, evidence, trigger, and residual risk.

### Exercise 3: Agent-Ready Kanban Control Plane

#### Define a required card schema and test real control-plane decisions

**Priority:** P1

**Required card fields**

- Reproduction or evidence.
- Owner and reviewer.
- State and state history.
- Reserved paths and collision rule.
- Verification command.
- Acceptance and merge criteria.
- Dependencies and merge order.
- Rollback or cancellation instruction.

**Required change**

- Provide the schema and automated validation rules.
- Include one deliberately conflicting pair of cards.
- Include one failed, cancelled, or rejected lane.
- Keep card state consistent across the board, ownership map, application data, and integration log.

**Done when**

- The exercise demonstrates why work was blocked, serialized, rejected, or cancelled, not only how one successful lane was merged.

## 09 Code Review

### Exercise 1: Semgrep Security and Accessibility Review Gauntlet

#### Provide a runnable vulnerable target and separate scanner findings from reviewer judgment

**Priority:** P0

**Required change**

- Provide a vulnerable branch that can be checked out and tested.
- Ensure the supplied patch applies cleanly if a patch is also provided.
- Include one true issue Semgrep detects, one plausible Semgrep false positive, and one behavior bug that requires manual reasoning.
- Add an API or server policy boundary so approval or state-transition rules are not enforced only in the UI.

**Done when**

- Participants must prove which scanner findings are valid and which should be dismissed.
- Confirmed issues receive regression tests at the correct boundary.

### Exercise 2: Fresh-Agent Diff Triage

#### Make the comparison range reproducible and include reviewer noise

**Priority:** P0

**Required change**

- Ship an applicable review branch.
- Publish the exact base and head SHAs.
- Confirm the patch applies to the supplied base.
- Include one plausible but false review finding that must be dismissed with evidence.

**Done when**

- A fresh reviewer can reproduce the exact diff locally.
- The participant demonstrates both finding real defects and rejecting unsupported findings.

### Exercise 3: Promptfoo Review Regression Lab

#### Measure real review behavior, not expected keyword matching

**Priority:** P0

**Required change**

- Keep deterministic checks as a fast sanity lane.
- Run the same historical bad diffs against the model used for real reviews.
- Ensure the provider does not encode expected findings or exact prompt keywords.
- Add harmless look-alike diffs, multi-bug cases, and clean controls.
- Define adoption thresholds for recall, clean-control precision, and regression versus the previous prompt.

**Done when**

- Adding checklist words alone cannot guarantee a higher score.
- The improved prompt passes the historical defects without increasing false blockers on clean cases.
- Evaluation results include the model, configuration, sample count, score, and known limitations.

## Recommended implementation order

### Phase 1: Correct invalid or missing exercise inputs

1. Repair the Playwright and MSW starters.
2. Mount the workflow in the NFR starter.
3. Add real inputs to the three Skill Packaging exercises.
4. Add runnable branches and reproducible ranges to the first two Code Review exercises.
5. Add explicit product tasks to the parallel worktree exercise.

### Phase 2: Standardize completion and review

1. Add the acceptance and evidence contract template.
2. Pin toolchains and add clean-checkout verification.
3. Add automated starter-smoke checks to prevent README drift.

### Phase 3: Add the accepted exercise-specific proof steps

1. Add the fresh-agent onboarding follow-up.
2. Add executable guardrail policy tests.
3. Add mandatory clarification and assumption handling to Spec Framing.
4. Add verifiable worktree handoffs and consistent Kanban states.
5. Add final-state NFR rechecks.
6. Add real-skill and real-review-model evaluation lanes.

## Pull request checklist for repository improvements

- [ ] The README describes the workflow that actually ships.
- [ ] The intended starter problem can be reproduced.
- [ ] Required inputs are real and independently inspectable.
- [ ] Setup versions and clean installation commands are documented.
- [ ] Acceptance criteria are explicit.
- [ ] Evidence files, paths, and commands are explicit.
- [ ] The verification fails when the seeded problem or expected behavior is changed.
- [ ] Exercise state and evidence are consistent across documentation, code, and Git history.
- [ ] No requirement depends on information available only in the original feedback report.

## Source report coverage

This plan consolidates feedback from the following reports:

1. `toolchain setup ex 1.docx`
2. `toolchain setup ex 2.docx`
3. `spec framing - ex 1.docx`
4. `test automation ex 1.docx`
5. `test automation ex 2.docx`
6. `test automation ex 3.docx`
7. `skill packaging ex 1.docx`
8. `skill packaging ex 2.docx`
9. `skill packaging ex 3.docx`
10. `multi agent workflows ex 1.docx`
11. `multi agent workflows ex 2.docx`
12. `multi agent workflows ex 3.docx`
13. `code review ex 1.docx`
14. `code review ex 2.docx`
15. `code review ex 3.docx`

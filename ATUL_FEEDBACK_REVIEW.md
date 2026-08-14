# Atul Feedback Review Against the Current Exercise Repository

## Purpose

This document consolidates Atul's comments from:

- `Readme Analysis.md`
- `Feedback for Challenge Mode.md`
- The exercise-specific feedback shared in chat

Atul tested an older version of the exercises. Every recommendation below is therefore compared with the current repository at commit `d41347c` before being accepted.

Exercise numbers use `competency.exercise`. For example, `1.1` means Toolchain Setup, Exercise 01, Agent Onboarding Kit.

## Status Definitions

| Status | Meaning |
|---|---|
| Already addressed | The latest repository contains the requested correction or equivalent protection. |
| Partially addressed | The main problem is reduced, but a useful part of the feedback remains open. |
| Should address | The problem still exists and the proposed change would materially improve the exercise. |
| Consider later | A valid product improvement, but not a defect blocking the current exercise. |
| No change needed | The feedback conflicts with the intended challenge design or is already covered sufficiently. |

## Executive Decision

The feedback is useful, but it should not all be treated as new work.

### Implemented in this update

1. Exercise 5.3 now uses a ceiling-aware gate and accepts a correct reject-without-package result when a candidate does not prove value.
2. Exercise durations are defined as active challenge targets after setup in `docs/EXERCISE_SETUP_AND_TIME.md`.
3. The shared guide now covers base prerequisites, tool-specific setup, minimum repeated-model run counts, cost preflight, and provider-failure handling.
4. Exercises 1.1, 1.2, and 2.2 reveal fewer diagnoses and implementation choices while retaining their safety and comparison contracts.
5. Exercise 4.1 now has browser setup and readiness commands. Exercise 4.2 has a fail-transparent, tamper-evident command capture wrapper.
6. Exercise 5.1 now verifies exact context bytes. Exercise 5.2 now verifies provider metadata, timestamps, selected skills, raw routing responses, and response hashes.

### Already addressed in the latest repository

- Discipline 07 is now numbered 01 to 03 instead of 04 to 06.
- All 34 exercises now have a `lab-contract.json`.
- The stale Excalidraw, Ponytail, and alert-triage contract wording has been removed.
- Payment visualization, Progressive Context Budget, Minimal-Diff Scope Budget, and Trace-Backed Workflow Optimizer contracts were aligned with their current READMEs.
- All exercises now link to exercise-specific evidence instructions and the shared submission standard.
- Every exercise has protected inputs, executable implementation checks, submission checks, and one `npm run verify:exercise` command.
- The repository contract verifier currently validates 34 exercise contracts and 221 starter artifacts.
- The shared evaluation-rubric document was intentionally removed. Completion is now decided by exercise-specific completion criteria and executable proof.

## Direct Feedback by Exercise

| ID | Exercise | Positive | Feedback | Current assessment | Decision |
|---|---|---|---|---|---|
| 1.1 | Agent Onboarding Kit | The before-and-after agent comparison is a strong way to prove whether onboarding works. | Instructions are too detailed and leave little room for thinking. | Addressed selectively. The README now states the repository problem without listing the expected mistakes, and learners decide what future agents need from repository evidence. | Keep the two-run comparison, safety boundaries, evidence, and `AGENTS.md` requirement because they define the competency rather than reveal the solution. |
| 1.2 | Agent Guardrails | It tests executable safety rather than relying only on written warnings. | Same issue as 1.1: the solution is heavily prescribed. | Addressed selectively. The README no longer lists the seeded attack paths or prescribes one policy decomposition. | Keep the restricted-data warning and common behavior contract, while allowing the learner to choose an agent-native design. |
| 2.1 | Spec-Driven Feature Development | Atul liked the evaluation method. The current exercise measures clarification, assumptions, traceability, and the absence of premature code. | No negative feedback was given in the direct notes. The attached challenge-mode review says the exact ambiguity categories and document files are prescribed. | The positive remains valid. The broader challenge-mode concern is also valid but is not a correctness defect. | Keep the evaluation approach. Later, allow any sensible decision-package structure and limit stakeholder questions without naming every ambiguity category. |
| 2.2 | Superpowers Skill-Driven Development | The production request is strong and covers realistic invitation behavior. | There should be more room for reviewer feedback about what should be standardized and what design choices belong to the learner. | Addressed selectively. The README now distinguishes the fixed business and skill-workflow contract from learner-owned internal design, module, data-flow, and test decisions. | Keep Superpowers stage order because using that workflow is the competency. Do not prescribe the feature's internal design. |
| 3.1 | Handoff Skill Incident Rescue | Atul liked the framing. The scenario clearly demonstrates stale and contradictory context. | The correct implementation is not fully described in the request. | This is intentional and appropriate. The current request states required observable behavior and tells learners to identify authoritative repository sources. Completion criteria and protected tests define correctness without revealing the solution. | No change needed. Do not add the implementation answer to the request. Only clarify a requirement if the protected behavior cannot be derived from repository evidence. |

## Hands-On Feedback for Exercises 4.1 to 5.3

### 4.1 Playwright MCP Checkout Rescue

**Positive**

The exercise is realistic and challenging. It demonstrates why fixed waits, generated CSS selectors, shared state, and one successful browser run are unreliable. Accessibility and network inspection are valuable investigation methods.

**Feedback**

Browser and MCP setup consumed too much time, and the evidence burden felt high for a 45-minute challenge.

**Current status: Addressed**

The application now provides `npm run setup:browser` and `npm run setup:check`, and the README places setup before the 45-minute active challenge time. MCP connection remains agent-specific and must be confirmed separately.

**Implemented action**

- Added documented browser installation and local readiness commands before challenge timing begins. MCP connectivity is confirmed in the selected agent because the repository cannot inspect every agent client.
- Labeled 45 minutes as active challenge time after setup.
- Keep the investigation, test matrix, comparison, repeat result, and trace because each proves a different release claim.

### 4.2 TDD Skill Network Boundary Rescue

**Positive**

This is one of the strongest exercises. It makes red-green-refactor observable at the real network boundary and shows that a skill can improve the process even when final code is similar.

**Feedback**

Manual recording of every red and green command, timestamp, output, and exit code is error-prone.

**Current status: Addressed**

The supplied `npm run evidence:capture` wrapper now records UTC times, exact commands, Git revision, working-tree hash, stdout, stderr, duration, exit code, and a record hash to JSONL. It returns the original command's exit code, and the verifier checks red-before-green order and record integrity.

**Implemented action**

Added a fail-transparent command wrapper and made its append-only JSONL part of the executable submission check.

### 4.3 Verification Skill Workflow Gate

**Positive**

The lesson is clear and practical: one passing test does not prove a release. Combining the React client, Spring provider, contracts, builds, and failure propagation resembles real release engineering.

**Feedback**

Add a deliberate failure exercise proving that one broken stage stops the gate before restoring it and running successfully.

**Current status: Already addressed**

The current README requires proof of success, non-zero child failure, and process-spawn failure. The protected gate contract verifies that execution stops immediately and preserves a non-zero result.

**Decision**

No additional change is required. Keep this behavior protected by the executable verifier.

### 5.1 Progressive Disclosure Release Skill

**Positive**

The exercise clearly teaches skill packaging through concise instructions, on-demand references, reusable scripts, real Git input, and evaluations.

**Feedback**

The exercise claims that progressive disclosure reduces context cost but does not require a numerical before-and-after measurement.

**Current status: Addressed**

The exercise now supplies `npm run context:measure`, requires exact UTF-8 byte counts per loaded file and scenario, and verifies that the full-release skill context is smaller than the monolithic draft. Provider token telemetry remains optional because not every agent exposes it.

**Implemented action**

Added deterministic context-byte totals for every loaded skill resource. Runtime token usage remains optional when the selected agent exposes it.

### 5.2 Skill Trigger Boundary Evaluations

**Positive**

Positive, negative, neighboring, and held-out cases make trigger precision understandable. Atul observed held-out improvement from 87.5 percent to 100 percent.

**Feedback**

Model identity, sampling settings, selected skill, and raw decisions should be captured reproducibly by a supplied runner.

**Current status: Addressed without a provider-specific runner**

The shared evidence schema now also requires provider, UTC timestamp, selected skills, unedited raw response, and response SHA-256. The verifier checks the hash and confirms that `triggered` agrees with the selected-skill list. Collection remains agent-neutral.

**Implemented action**

Kept collection agent-neutral and added timestamp, selected-skill, raw-response, and response-hash proof to the shared schema.

### 5.3 Skill Benchmark and Package Gate

**Positive**

The exercise correctly treats skill adoption as a measured quality, critical-safety, variance, token, time, and package-provenance decision.

**Feedback**

The no-skill baseline scored 18 of 18 in all three held-out runs. The gate still requires the candidate to improve by at least 10 percentage points, making completion mathematically impossible.

**Current status: Addressed**

The benchmark now uses normal improvement mode below 95 percent and ceiling-aware mode at or above 95 percent. Ceiling mode requires no quality or critical regression plus a measured token, elapsed-time, or variance improvement. If the candidate still proves no value, a benchmark-bound `reject` decision without an archive is a valid passing submission.

**Implemented action**

Implemented the ceiling-aware gate and valid reject outcome. The protected held-out cases were intentionally left unchanged in this update so the fix does not tune the evaluation to one colleague's observed outputs.

## Repository-Wide Feedback

| Feedback | Current status | Decision and next action |
|---|---|---|
| Exercise timeboxes are unrealistic when setup, multiple sessions, repeated runs, evidence, and review are included. | Addressed. The root guide defines duration as active work after setup; Exercise 4.1 states this locally because its browser setup is substantial. | Keep one shared definition instead of repeating a disclaimer in all 34 READMEs. |
| The repository assumes TypeScript, React, Git, browser testing, Java, CI, security, Mermaid, and model-evaluation knowledge. | Addressed at the repository level. The shared guide lists base and tool-specific prerequisites. | Keep detailed commands in the local exercise only when they are required to start that project. |
| Repeated model evaluations need declared API access, expected call count, time, and cost. | Addressed. The shared guide lists minimum runs for 5.2, 5.3, 9.3, 10.2, and 12.3, plus quota, cost-preflight, and provider-failure rules. | Do not publish a fixed currency amount because provider prices and prompt sizes change. |
| Internal README, lab, submission, and verifier contracts had drifted. | Already addressed. | No further content change. Keep `npm run verify:contracts` as the regression gate. |
| Discipline 07 used numbers 04 to 06 and lacked one lab contract. | Already addressed. It is now 01 to 03 and all three exercises have lab contracts. | No further action. |
| The technology mix is heavily React, Vite, and TypeScript. | Still true. | Consider later. Add Python/service, infrastructure, database-migration, or deployment exercises only when expanding the curriculum. Do not rewrite good existing exercises only to vary technology. |
| A prerequisite matrix and realistic setup guidance are needed. | Addressed in `docs/EXERCISE_SETUP_AND_TIME.md`. | Keep the matrix centralized and link it from the root learner workflow. |
| Add concept primers and worked examples. | Not suitable inside the challenge READMEs. | Consider a separate optional learning-mode guide. Do not add tutorial answers to challenge briefs. |
| Add exercise-specific scoring rubrics. | Intentionally superseded. The repository now uses completion criteria and executable verifiers instead of evaluation rubrics. | No change needed unless human grading becomes a product requirement. Do not restore the removed generic rubric. |
| Clarify when a named tool is mandatory and when an equivalent is accepted. | Addressed in the shared setup guide. | A named tool remains mandatory only when it is the competency or the before-and-after comparison variable. |
| Add a consistent hands-on feedback template. | Not present as a repository artifact. | Consider adding `docs/EXERCISE_FEEDBACK_TEMPLATE.md`. This would make future feedback easier to compare and separate setup difficulty from exercise-design defects. |
| Add a cross-discipline production capstone. | Not present. | Consider later. This is a valuable new exercise, not a correction to the existing 34. |
| Add a tool-calling reliability and human-approval challenge. | Not present as a dedicated exercise. | Consider later. Agent Guardrails covers repository operations, but not idempotent external tool calls, approval expiry, retries, and partial failure. |

## Challenge-Mode Review for All Exercises

The challenge-mode document contains one recurring message: many READMEs disclose both the problem and the solution recipe. This remains broadly true in the latest version. The current exercises are clear and verifiable, but many assess execution discipline more than independent diagnosis and solution design.

The recommended balance is:

- Keep business outcomes, public contracts, safety limits, budgets, evidence, and completion checks explicit.
- Hide seeded-defect lists, exact internal architecture, ideal file decomposition, and unnecessary step ordering.
- Put expected answers and transfer cases in protected verifiers or facilitator material.
- Preserve exact workflow order only when following that workflow is the competency itself.

| Exercise | Strength to preserve | Current status of challenge-mode feedback | Recommendation |
|---|---|---|---|
| 1.1 Agent Onboarding Kit | Behavior is compared before and after onboarding. | Partially addressed; supporting documents are learner-chosen, but the experiment recipe remains detailed. | Reduce repeated mechanics and leave onboarding decomposition open. Keep the unseen reviewer task. |
| 1.2 Agent Guardrails | Tests real allowed, denied, approval, bypass, and audit behavior. | Still too revealing about attack paths and policy architecture. | Hide attack variants in protected tests and allow alternative agent-native designs. |
| 2.1 Spec-Driven Feature Development | Strong clarification and traceability evaluation. | Exact question categories and file set are still prescribed. | Allow any compact decision package and limit questions rather than naming every category. |
| 2.2 Superpowers Skill-Driven Development | Demonstrates that a workflow skill changes execution order. | The complete lifecycle is still supplied. | Keep Superpowers stages, but introduce a policy change and leave feature design choices open. |
| 3.1 Handoff Skill Incident Rescue | Strong stale-context and authority problem. | The README still announces the types of bad context. | Hide some diagnosis and add a late incident update as a transfer check. |
| 3.2 Domain Modeling Product Rules Rescue | Makes overloaded vocabulary and authorization risk concrete. | Exact terms, documents, and final authorization rule are disclosed. | State the access outcome and constraints; let the learner discover the vocabulary model. |
| 3.3 Graphify Billing Knowledge Graph | Tests graph-assisted dependency discovery and source verification. | Graph questions and major defects are supplied, and setup may dominate. | Use learner-generated questions, a larger corpus, and a stale-graph change event. |
| 4.1 Playwright MCP Checkout Rescue | Excellent real-browser reliability problem. | Flaky mechanisms and expected test design are disclosed. | Provide symptoms and journeys, hide the mechanism, and add setup verification. |
| 4.2 TDD Network Boundary Rescue | Strong real-boundary TDD evidence. | Six states, three slices, MSW seam, and order are prescribed. | Keep public behaviors and strict isolation, but let learners choose TDD slices. Add automatic command capture. |
| 4.3 Verification Workflow Gate | Strong fail-closed full-stack verification lesson. | Failure behavior is now tested, but exact defects and gate implementation are disclosed. | Keep the deliberate failure proof; hide defect locations and allow maintainable gate structures. |
| 5.1 Progressive Disclosure Release Skill | Real Git range, selective resources, extractor, and evals. | Improved, but package layout and resource split are prescribed. | Keep the Agent Skills standard, allow package decomposition choices, and measure context cost. |
| 5.2 Skill Trigger Boundary Evals | Measures recall, specificity, stability, and held-out behavior. | Real metadata is now validated, but the case split and edit target remain highly directed. | Hide final held-out cases and include compound or clarification-worthy requests. |
| 5.3 Skill Benchmark and Package Gate | Strong quality, cost, variance, and provenance model. | The gate is currently unsatisfiable under a perfect baseline. | Fix immediately with harder cases and a ceiling-aware adopt, revise, or reject decision. |
| 6.1 Parallel Worktree Conflict Rescue | Preserves attributable lane commits and integration history. | Three lanes, ownership, merge order, and shared-file solution are supplied. | Let learners decide which work can run in parallel and add a late shared-contract discovery. |
| 6.2 Specialist Review Merge Gate | Rechecks the exact final SHA and forces finding triage. | Specialist count, roles, and seeded risks are explicit. | Let learners choose review coverage and seed one unsupported specialist finding. |
| 6.3 Agent Kanban Collision Control | Makes readiness and ownership mechanically testable. | Exact invalid cards, ready card, state transitions, and mirrors are prescribed. | Specify control properties and let learners design the minimum state model. Add reopen or partial-cancel behavior. |
| 7.1 Workflow Diagram Reconstruction | Source-backed diagrams and contradiction tracking are strong. | Numbering and lab contract are fixed; exact diagram types and routes remain prescribed. | Let learners choose the smallest diagram set that proves states, actors, failures, and rollback. |
| 7.2 Code Graph Rescue | Connects graph accuracy, source proof, code correction, and diagrams. | The routing defect, correct fallback order, queries, and diagram types are disclosed. | Present the unexpected-channel incident and let learners discover the safe edit boundary. |
| 7.3 Payment Visualization | Ties diagrams to a real idempotency defect and exact source lines. | Contract drift is fixed; four diagrams and the duplicate-event solution remain prescribed. | Keep behavior constraints but allow diagram choice and add out-of-order or concurrent delivery. |
| 8.1 PR Evidence Pack | Correctly preserves failure status, provenance, digests, and reviewer action. | Exact generator, schema, workflow structure, and `always()` solution are prescribed. | Specify trustworthy evidence properties and test cancelled, stale, and digest-mismatch cases. |
| 8.2 Feature Flag Kill-Switch Proof | Clear operational rollback and side-effect boundaries. | Exact interface, default, script, and implementation behavior are supplied. | Keep rollback SLO and safety properties; allow any provider-independent boundary. |
| 8.3 Performance and Accessibility Gate | Uses comparable raw reports and fail-closed thresholds. | Deliberate failing mutations are included, but exact defects, tools, run count, and aggregation are directed. | Keep business thresholds explicit; let learners justify tools and sampling while preventing environment gaming. |
| 9.1 Security and Accessibility Review | Strong mix of scanner signal, false positive, manual issues, and boundary tests. | The README reveals every real defect and the false positive. | Give only the exact range, context, budget, and finding standard. Keep expected findings protected. |
| 9.2 Independent Diff Triage | Fresh review and evidence-based dismissal are valuable. | The four defects and planted reviewer noise are disclosed. | Hide expected defects and do not announce which prior reviewer claim is false. |
| 9.3 Code Review Regression Gate | Measures recall and clean-control precision with real model output. | Better protected evaluation exists, but case types and evaluation plan remain detailed. | Keep final cases hidden and add token or latency limits to prevent checklist expansion. |
| 10.1 Progressive Context Budget | Correctly treats authority and relevance as well as size. | Old lab drift is fixed; the exact selection algorithm is still given. | Supply imperfect metadata and let learners derive selection and expansion rules. |
| 10.2 Risk-Based Model Routing | Includes safety floors, retries, escalation, latency, and cost. | Routes and required allocation logic are prescribed. | Provide black-box tiers and outcomes; let learners derive routing and test a pricing or availability change. |
| 10.3 Minimal-Diff Scope Budget | Makes review cost and negative scope measurable. | Ponytail drift is fixed; exact paths, line budget, helper, and desired change are supplied. | Let learners declare the scope budget and discover the safe reuse path. |
| 11.1 Characterization-First Refactor | Excellent separation of refactor authorization from bug-fix authorization. | Surprising cases and characterization method are supplied. | Give the compatibility requirement and imperfect oracle, then let learners choose sufficient characterization. |
| 11.2 Strangler Checkout Route | Strong incremental replacement and duplicate-authorization boundary. | Exact module, route, seam, fallback, and preserved paths are prescribed. | State the migration outcome and rollback need; let learners select the seam. |
| 11.3 Full-Stack Rules Extraction | Strong protection of backend side effects, HTTP JSON, and client behavior. | Exact class name and service-policy responsibility split are supplied. | Require separation and contract preservation without prescribing the internal architecture. |
| 12.1 Session Waste Reduction | Measures improvement from raw events without counting useful work as waste. | Waste categories, thresholds, and intervention are prescribed. | Let learners define defensible categories and choose one intervention from causal evidence. |
| 12.2 Repeated Mistake to Repository Rule | Turns repeated review corrections into durable controls. | Exact mistakes, rule files, and solution mechanism are supplied. | Let learners choose rule, context, skill, hook, test, or no automation. Include a valid task a simplistic rule would block. |
| 12.3 Workflow Optimizer | Strong held-out, critical, variance, cost, and adoption checks. | Old lab drift is fixed; failure clusters and the 48-run procedure remain prescribed. | Let learners discover clusters and add a distribution-shift case where extra caution can be harmful. |

## Recommended Backlog

### P0: Correctness blocker

1. Make Exercise 5.3's benchmark gate ceiling-aware and strengthen its held-out cases.

### P1: High-value improvements

1. Add realistic time, setup, prerequisite, API, and expected-cost metadata.
2. Add a setup-readiness command for Exercise 4.1.
3. Add fail-transparent automatic red/green command capture for Exercise 4.2.
4. Add numeric context-cost measurement to Exercise 5.1.
5. Extend Exercise 5.2 decisions with raw response, timestamp, and response hash.
6. Perform a challenge-mode pass that removes disclosed diagnoses and unnecessary solution recipes while retaining explicit outcomes and evidence.

### P2: Product expansion

1. Add a standard exercise feedback template.
2. Add a cross-discipline capstone.
3. Add a tool-calling reliability and human-approval exercise.
4. Broaden the technology mix when adding new exercises.

## Final Recommendation

Do not reapply feedback that referred to the old contract drift, old Discipline 07 numbering, missing lab contracts, or missing starter artifacts. Those items are already fixed.

The most important unresolved defect is Exercise 5.3's impossible improvement gate. After that, prioritize operational fairness through setup checks, realistic time and cost information, and reliable evidence capture.

The repeated comment that exercises are too detailed is valid as a challenge-design concern. Address it carefully: remove disclosed diagnoses and prescribed internal solutions, but keep business requirements, safety constraints, evidence, and pass-or-fail completion criteria clear.

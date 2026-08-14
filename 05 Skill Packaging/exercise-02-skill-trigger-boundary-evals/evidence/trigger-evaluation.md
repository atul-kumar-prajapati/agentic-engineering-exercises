# Trigger Evaluation Evidence

## Evaluation setup

- Date: 2026-08-14
- Model: Codex GPT-5-family subagents using the inherited session model; two baseline agents self-reported `GPT-5`, while the remaining agents exposed only `Codex inherited model`
- Settings: default Codex sampling and reasoning settings; no temperature or seed controls were exposed
- Method: three runs per request before and after the metadata change, each performed as an isolated model decision
- Split: 12 train requests and 8 held-out requests (40 percent held out)
- Raw results: `skill-trigger-app/results/before.json` and `skill-trigger-app/results/after.json`
- Protected fixtures: `skill-trigger-app/evals/trigger-evals.json` was read for scoring only and was not edited

Each evaluator received only the three skill descriptions and the request text. Expected labels and repository files were withheld. Baseline and candidate decisions came from separate fresh subagents. The candidate was selected by held-out score, not train score.

## Descriptions evaluated

Baseline:

> Review and summarize changes when someone wants feedback.

Candidate:

> Inspect an actual code diff, pull request, branch, patch, or change set and report actionable defects with file-and-line evidence for merge or approval decisions. Use when the requested outcome is code-review findings about behavior, correctness, security, accessibility, compatibility, or regressions. Do not use for release communications, operational incident reports, summaries or explanations without a review artifact, general review advice, or requests that combine code review with a separate release or incident deliverable.

Only the real `change-review` frontmatter description changed. The skill body and neighbouring skill descriptions remained unchanged.

## Three-run trigger rates

| Case | Split | Expected | Before | After |
| --- | --- | ---: | ---: | ---: |
| `train-review-auth` | Train | Trigger | 3/3 (100%) | 3/3 (100%) |
| `train-review-race` | Train | Trigger | 3/3 (100%) | 3/3 (100%) |
| `train-review-accessibility` | Train | Trigger | 3/3 (100%) | 3/3 (100%) |
| `train-review-noisy` | Train | Trigger | 3/3 (100%) | 3/3 (100%) |
| `train-review-data` | Train | Trigger | 3/3 (100%) | 3/3 (100%) |
| `train-review-api` | Train | Trigger | 3/3 (100%) | 3/3 (100%) |
| `train-release` | Train | Abstain | 0/3 (0%) | 0/3 (0%) |
| `train-incident` | Train | Abstain | 0/3 (0%) | 0/3 (0%) |
| `train-concept` | Train | Abstain | 0/3 (0%) | 0/3 (0%) |
| `train-doc` | Train | Abstain | 0/3 (0%) | 0/3 (0%) |
| `train-compound` | Train | Abstain | 3/3 (100%) | 0/3 (0%) |
| `train-no-artifact` | Train | Abstain | 0/3 (0%) | 0/3 (0%) |
| `held-review-paraphrase` | Held-out | Trigger | 3/3 (100%) | 3/3 (100%) |
| `held-review-small` | Held-out | Trigger | 3/3 (100%) | 3/3 (100%) |
| `held-review-java` | Held-out | Trigger | 3/3 (100%) | 3/3 (100%) |
| `held-review-react` | Held-out | Trigger | 3/3 (100%) | 3/3 (100%) |
| `held-release-paraphrase` | Held-out | Abstain | 0/3 (0%) | 0/3 (0%) |
| `held-postmortem` | Held-out | Abstain | 0/3 (0%) | 0/3 (0%) |
| `held-diff-summary` | Held-out | Abstain | 0/3 (0%) | 0/3 (0%) |
| `held-compound` | Held-out | Abstain | 3/3 (100%) | 0/3 (0%) |

## Scores and errors

| Metric | Before | After | Change |
| --- | ---: | ---: | ---: |
| Train score | 33/36 (91.7%) | 36/36 (100%) | +8.3 points |
| Held-out score | 21/24 (87.5%) | 24/24 (100%) | +12.5 points |
| Overall score | 54/60 (90%) | 60/60 (100%) | +10 points |
| False positives | 6 decisions across 2 cases | 0 | -6 decisions |
| False negatives | 0 | 0 | No regression |

Before the change, all three agents incorrectly triggered on both compound cases: one combined review with release-note publication and the other combined review with incident reporting. After the change, all three agents abstained on both. Release-note, incident, conceptual, document-summary, and artifact-free advice negatives stayed correctly excluded, while every substantive review paraphrase stayed correctly included.

## Adoption decision

Adopt the candidate description. The held-out score improved from 87.5 percent to 100 percent, exceeds the required 75 percent threshold, removes every observed false positive, and introduces no false negatives. The description states reusable artifact, outcome, and neighboring-workflow boundaries rather than embedding case IDs or exact evaluation wording.

## Verification

All commands were run on 2026-08-14 from `skill-trigger-app`.

| Command | Result | Relevant output | Requirement connection |
| --- | --- | --- | --- |
| `npm run eval:fixtures` | Exit 0 | `Trigger fixtures contain 20 unique positive and negative train/held-out requests.` | Confirms the protected evaluation set and split structure used by both raw result files. |
| `npm run test:submission` | Exit 0 | `Trigger evaluation uses repeated train and held-out model decisions and improves the real description.` | Confirms three before/after runs per case, held-out improvement, metadata boundaries, and report completeness. |
| `npm run agent:check` | Exit 0 | `Verified 6 protected challenge inputs`; lint, agent check, format, typecheck, and Vite build passed. | Confirms protected fixtures and neighbours remained unchanged and the complete application gate passes. |

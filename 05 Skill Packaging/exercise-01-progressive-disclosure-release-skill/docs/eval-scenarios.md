# Release Skill Evaluation Scenarios

Use the materialized `release-history.bundle` repository for all scenarios.

## full-release

- Range: `exercise-base..origin/exercise-head`
- Request: Create customer release notes for this range. Trace every published item to Git, identify breaking and migration impact, report missing verification evidence, and exclude internal-only work.
- Expected resource need: publication, evidence, and migration policy plus the Git extractor.

## hotfix-only

- Range: `exercise-base..hotfix-head`
- Request: Create customer release notes for this hotfix range with Git traces and verification status.
- Expected resource need: publication and evidence policy plus the Git extractor. Migration policy is unrelated.

## internal-only

- Range: `breaking-head..origin/exercise-head`
- Request: Check whether this range contains anything suitable for customer release notes and support the decision with Git evidence.
- Expected resource need: publication policy plus the Git extractor. Evidence and migration policies are unrelated when nothing is published.

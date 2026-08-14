# Before-and-after comparison

## Comparable setup

Both runs used a fresh isolated Codex agent, the same model family, read-only permissions, a 10-minute limit, attempt number 1, the same exact release request, the same Git comparison, and the same PR and CI source inputs. The controlled difference was the instruction package: the baseline received the raw monolithic prompt, while the after run had the `release-notes` skill enabled.

## Accuracy

The baseline correctly identified the checkout retry, billing rename, and two evidence gaps, so the comparison does not rely on an artificially poor first result. It nevertheless published the internal telemetry rename, provided no Git trace for either customer claim, and did not follow the required customer-facing structure. The skill-enabled run excluded internal telemetry, put the breaking API rename first with migration impact, traced both entries to real changed paths, and attached passed and missing evidence to the affected claims.

## Progressive disclosure and context

The package keeps routing and workflow in `SKILL.md`, publication detail in `references/release-policy.md`, and deterministic Git extraction in `scripts/extract-release.mjs`. This progressive disclosure separates context by purpose: an agent reads policy only when classifying or publishing, while Git extraction runs as code rather than consuming model context with improvised shell pipelines. The skill contains no fixture-specific expected answer.

## Verification

The same release verifier was used for both outputs. The baseline failed with exit code 1; the skill-enabled output passed with exit code 0 and verified two customer-facing items. Structural skill validation and the extractor fixture test are recorded in the final command evidence.

## Decision

Adopt the packaged skill. It improves publication accuracy and verification discipline while creating a reusable context boundary between trigger guidance, detailed policy, and deterministic repository inspection.

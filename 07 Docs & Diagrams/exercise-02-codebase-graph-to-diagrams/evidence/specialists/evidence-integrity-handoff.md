# Evidence Integrity Handoff

Reviewer: read-only specialist against HEAD `759cf1efe1aabead32da1ae724d17cb576ba0016` before the size-floor fix.
Commands: `npm run test:integrity` (exit 0), `npm run graph:verify` (exit 0), `npm run test:submission` (exit 1).

## Verdict

Reject on the first bound evidence set. Hashes, ancestry, protected inputs, and command strings matched; the submission contract size floor did not.

## Findings

| ID | Finding | path | Disposition | Reason |
| --- | --- | --- | --- | --- |
| EI-01 | `diagrams/notification-dependencies.mmd` trim length 237 < `minCharacters` 240 | `submission-contract.json` requiredFiles[1] | fix | Added a Mermaid comment documenting shared ProviderStatus edges. New source SHA `2ad2e9f2f287ce671e36bcc7b7f68ba12acb1d7a`. Graph and hashes regenerated from that commit. |
| EI-02 | Manifest hashes matched `shasum -a 256` | eight artifacts | accept | No trailing-newline mismatch. |
| EI-03 | Command strings and PASS/SHA captures | `evidence/graph-manifest.json` | accept | Exact required commands. Recaptured after the new source SHA. |
| EI-04 | Protected inputs untouched | `challenge-integrity.json` | accept | `test:integrity` exit 0. |
| EI-05 | Diff vs base stays in the exercise | `git diff --name-only 3761a42` | accept | Router plus two diagrams at source time; artifacts/evidence after. |

Rejected findings: none. The specialist correctly required a new `source_sha` rather than padding diagrams in an evidence-only commit.

# Skill Catalog Boundaries

Route by the user's primary requested action:

- Use `change-review` when the user wants an existing diff, branch, commit, or pull request inspected for defects or merge risk. Its output is evidence-backed findings tied to code locations.
- Use `release-notes` when the user wants customer-facing release communication from merged changes and verification evidence.
- Use `incident-summary` when the user wants an operational incident report from timeline, impact, remediation, and follow-up evidence.

Do not use `change-review` to implement fixes, debug a failure without a supplied change, write a pull-request description, summarize an approved diff, review a design document, explain review practices, publish release notes, or report an incident.

Do not force a request containing multiple independent workflows into one skill. Split the work or ask the user which workflow should run first.

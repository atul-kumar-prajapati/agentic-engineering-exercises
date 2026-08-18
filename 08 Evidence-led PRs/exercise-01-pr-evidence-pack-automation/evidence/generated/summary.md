# PR Evidence Pack

Source SHA: 70def5638a1604d0d1e8708bc7f5016674144403
Overall result: failed
Overall exit code: 1

## unit-tests

Result: passed
Exit code: 0
Artifact: artifacts/unit-tests.txt
SHA-256: 9b7fc6d757f88523a12c54ebef3b7fede27e4c144852fc9b8920a2a517c4b5cc
Risk: Low: unit behavior passed for this revision.
Reviewer action: Confirm the unit-test artifact digest and result.
Rollback: Revert the PR commit if later regression evidence appears.

## checkout-smoke

Result: failed
Exit code: 1
Artifact: artifacts/checkout-smoke.txt
SHA-256: cb7437313d1a9a1414cf18811209da242fb555e1b0c605353cbaab294ac121da
Risk: High: checkout cannot complete in the smoke scenario.
Reviewer action: Block merge until the smoke failure is explained and corrected.
Rollback: Do not deploy; if already deployed, revert the checkout change.

## ui-screenshot

Result: passed
Exit code: 0
Artifact: artifacts/checkout.svg
SHA-256: 13a5ba8a1561d73fb8eaf0d5ab88c2c351a1ac7ed8a6abc2f8ebb77cef017d98
Risk: Medium: a screenshot proves rendering but not successful checkout.
Reviewer action: Compare the screenshot with the expected checkout state.
Rollback: Revert the UI change if the visual state is not approved.


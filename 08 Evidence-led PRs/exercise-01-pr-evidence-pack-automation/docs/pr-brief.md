# PR Evidence Brief

The pull-request workflow applies only when this exercise or its dedicated workflow changes.

Required controls:

- Trigger with `pull_request`, never `pull_request_target`.
- Grant `contents: read` and no write permission.
- Pin third-party actions to complete 40-character commit SHAs.
- Use the protected revisions in [action-pins.json](./action-pins.json), and set checkout `persist-credentials` to `false`.
- Use `ubuntu-24.04`, a timeout of ten minutes or less, `.nvmrc`, and the exercise lockfile as the npm cache dependency path.
- Install from the committed lockfile with `npm ci`.
- Pass `${{ github.sha }}` to the evidence generator.
- Run evidence verification and artifact upload with `if: always()`.
- Upload `08 Evidence-led PRs/exercise-01-pr-evidence-pack-automation/evidence/generated` with `if-no-files-found: error` and retention of seven days or less.
- Do not use `continue-on-error`; the generator's failing exit must keep the job red.

The artifact name must contain the commit SHA so reviewers cannot confuse evidence from different revisions.

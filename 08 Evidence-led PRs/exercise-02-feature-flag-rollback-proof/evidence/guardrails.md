# Guardrail checks

Recorded on `codex/exercise-08-02-feature-flag-rollback-proof` at `f0f04a2fdd2ec6e92361dbb4e0fc274b5e192bb8` (source SHA `fdb2b5ccdc08936981ecbf23c0d35fe3dfc36ad1`). Working directory: repository root unless noted. These two checks were run during the original session and reported in chat; they were not in `evidence/` until this file.

## 1. `verify:exercise` must not modify tracked files

### Command

```bash
git status --porcelain
git status --porcelain --untracked-files=no
cd "08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app"
npm run verify:exercise
cd "$(git rev-parse --show-toplevel)"
git status --porcelain
git status --porcelain --untracked-files=no
```

### Result

`npm run verify:exercise` exit code: **0**

Final lines of stdout:

```
Source SHA: fdb2b5ccdc08936981ecbf23c0d35fe3dfc36ad1
PASS enabled evidence proves one evaluation, one API call, and one accurate telemetry event
PASS disabled and provider-error evidence prove legacy behavior with zero preview side effects
PASS rollback drill atomically disables the flag, clears targeting, records audit data, and meets the 1000 ms objective
PASS protected scenarios and rollback drill reproduce from the submitted implementation
PASS Git source binding and evidence-only follow-up history verified
Verified Feature Flag Kill-Switch Proof: 7 files and 2 directories.
```

`git status --porcelain --untracked-files=no` before: empty (exit 0).
`git status --porcelain --untracked-files=no` after: empty (exit 0).

Full `git status --porcelain` before and after were identical (exit 0). `diff` of the two listings is empty. The six `??` lines are pre-existing untracked files outside this exercise; none were added, removed, or modified by `verify:exercise`:

```
?? .DS_Store
?? .claude/
?? .github/
?? "06 Multi-Agent Workflows/.DS_Store"
?? "06 Multi-Agent Workflows/exercise-02-specialist-subagent-nfr-review/.DS_Store"
?? "08 Evidence-led PRs/exercise-01-pr-evidence-pack-automation/pr-evidence-app/scripts/generate-pr-evidence.mjs"
```

Tracked tree did not change. `dist/` is produced by `build` and is gitignored.

## 2. Restoring every protected path must still pass

### Command

Paths are the 44 keys in `feature-flag-app/challenge-integrity.json`, resolved relative to the app directory, then quoted because the exercise path contains spaces.

```bash
# emit the 44 repo-relative paths, then:
while IFS= read -r p; do
  git checkout upstream/main -- "$p"
done
git diff --stat HEAD
cd "08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app"
npm run verify:exercise
```

### Result

`git checkout` loop exit code: **0**. All 44 protected paths were checked out from `upstream/main`:

```
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/README.md
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/docs/evidence-contract.md
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/docs/flag-brief.md
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/docs/rollback-contract.md
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/docs/rollback-template.md
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/config/invoice-preview.json
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/fixtures/rollout-scenarios.json
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/index.html
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/lab-contract.json
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/package-lock.json
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/package.json
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/scripts/agent-check.mjs
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/scripts/capture-rollout-evidence.mjs
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/scripts/format-check.mjs
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/scripts/lint-check.mjs
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/scripts/rollout-harness.mjs
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/scripts/rollout-verification.mjs
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/scripts/run-rollback-drill.mjs
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/scripts/run-rollout-tests.mjs
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/scripts/test-rollout-verifier.mjs
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/scripts/verify-rollout-submission.mjs
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/src/App.tsx
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/src/components/ActionComposer.tsx
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/src/components/ActivityFeed.tsx
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/src/components/DetailPanel.tsx
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/src/components/EvidencePanel.tsx
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/src/components/FilterBar.tsx
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/src/components/MetricStrip.tsx
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/src/components/PageHeader.tsx
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/src/components/ScenarioBoard.tsx
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/src/components/WorkQueue.tsx
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/src/data/workItems.ts
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/src/domainReadiness.ts
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/src/labContract.ts
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/src/main.tsx
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/src/rollout/configFlagClient.mjs
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/src/services/workflowApi.ts
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/src/styles.css
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/src/types.ts
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/src/utils/filters.ts
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/src/utils/scoring.ts
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/submission-contract.json
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/tsconfig.json
08 Evidence-led PRs/exercise-02-feature-flag-rollback-proof/feature-flag-app/vite.config.ts
```

`git diff --stat HEAD` after checkout: empty. Protected files on this branch were already identical to `upstream/main`.

`npm run verify:exercise` after restore: exit code **0**. Same PASS lines and Source SHA `fdb2b5ccdc08936981ecbf23c0d35fe3dfc36ad1`.

`git status --porcelain --untracked-files=no` after restore + verify: empty.

The result does not depend on a modified protected input. `invoicePreview.mjs` and `scripts/rollback-invoice-preview.mjs` are not in the protected set and were not restored.

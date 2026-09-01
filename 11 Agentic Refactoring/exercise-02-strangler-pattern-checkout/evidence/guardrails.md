# Guardrail checks

Recorded on `codex/exercise-11-02-strangler-pattern-checkout` while `HEAD` was sourceSha `58878e4215a164c7a445bd4399118625e894d5e3`. Working directory: `/tmp/ex-11-02` unless noted. Protected-path list lived at `/tmp/ex-11-02-protected-paths.txt` (not in the exercise tree). `checkoutRouter.mjs` is not protected and was not restored.

## 1. `verify:exercise` must not modify tracked files

### Commands

```bash
cd /tmp/ex-11-02
git status --porcelain --untracked-files=no
cd "11 Agentic Refactoring/exercise-02-strangler-pattern-checkout/checkout-strangler-app"
npm run verify:exercise
cd /tmp/ex-11-02
git status --porcelain --untracked-files=no
git status --porcelain
```

### Result

Tracked porcelain **before** (`git status --porcelain --untracked-files=no`): empty. Exit code **0**.

`npm run verify:exercise` exit code: **0**.

Final lines of stdout:

```
Source SHA: 58878e4215a164c7a445bd4399118625e894d5e3
PASS route, comparison, rollback, and focused-history evidence
Verified Strangler Checkout Route: 7 files and 0 directories.
PASS verify:exercise left tracked files, the Git index, and untracked or ignored paths unchanged
```

Tracked porcelain **after** (`git status --porcelain --untracked-files=no`): empty. Exit code **0**. Identical to before.

Full `git status --porcelain` before and after were identical (exit 0). Pre-existing untracked evidence is OK; listings match:

```
?? "11 Agentic Refactoring/exercise-02-strangler-pattern-checkout/evidence/"
```

## 2. Restoring every protected path must still pass

Repo-relative protected paths (16). Quoted every path. Used a while-read loop against `/tmp/ex-11-02-protected-paths.txt`, not unquoted `$(cat)`.

### Commands

```bash
cd /tmp/ex-11-02
while IFS= read -r p; do
  git checkout upstream/main -- "$p"
done < /tmp/ex-11-02-protected-paths.txt
cd "11 Agentic Refactoring/exercise-02-strangler-pattern-checkout/checkout-strangler-app"
npm run verify:exercise
cd /tmp/ex-11-02
git diff HEAD
```

Each restore was `git checkout upstream/main -- "$p"` with `$p` quoted. `upstream/main` is `52090edddf032d026ece16ef90feb627bf8e67ac`.

### Restore loop (16 paths, every checkout exit 0)

```
git checkout upstream/main -- "scripts/run-clean-verification.mjs"
git checkout upstream/main -- "scripts/run-vite-build.mjs"
git checkout upstream/main -- "scripts/verify-protected-inputs.mjs"
git checkout upstream/main -- "11 Agentic Refactoring/exercise-02-strangler-pattern-checkout/README.md"
git checkout upstream/main -- "11 Agentic Refactoring/exercise-02-strangler-pattern-checkout/docs/checkout-cases.json"
git checkout upstream/main -- "11 Agentic Refactoring/exercise-02-strangler-pattern-checkout/docs/checkout-contract.md"
git checkout upstream/main -- "11 Agentic Refactoring/exercise-02-strangler-pattern-checkout/docs/checkout-legacy-map.md"
git checkout upstream/main -- "11 Agentic Refactoring/exercise-02-strangler-pattern-checkout/checkout-strangler-app/lab-contract.json"
git checkout upstream/main -- "11 Agentic Refactoring/exercise-02-strangler-pattern-checkout/checkout-strangler-app/package.json"
git checkout upstream/main -- "11 Agentic Refactoring/exercise-02-strangler-pattern-checkout/checkout-strangler-app/scripts/run-checkout-tests.mjs"
git checkout upstream/main -- "11 Agentic Refactoring/exercise-02-strangler-pattern-checkout/checkout-strangler-app/scripts/strangler-verification.mjs"
git checkout upstream/main -- "11 Agentic Refactoring/exercise-02-strangler-pattern-checkout/checkout-strangler-app/scripts/test-strangler-verifier.mjs"
git checkout upstream/main -- "11 Agentic Refactoring/exercise-02-strangler-pattern-checkout/checkout-strangler-app/scripts/verify-strangler-submission.mjs"
git checkout upstream/main -- "11 Agentic Refactoring/exercise-02-strangler-pattern-checkout/checkout-strangler-app/src/checkout/legacyCheckout.mjs"
git checkout upstream/main -- "11 Agentic Refactoring/exercise-02-strangler-pattern-checkout/checkout-strangler-app/src/labContract.ts"
git checkout upstream/main -- "11 Agentic Refactoring/exercise-02-strangler-pattern-checkout/checkout-strangler-app/submission-contract.json"
```

Restore loop: every path exit **0**. Loop fail flag **0**.

`legacyCheckout.mjs` was restored from `upstream/main` and remained identical to `HEAD`:

- SHA-256 before restore: `b42a2471c5b2624388a2bee2bb1cc765d14bd0244f2737b0406d03f82b06725e`
- SHA-256 after restore: `b42a2471c5b2624388a2bee2bb1cc765d14bd0244f2737b0406d03f82b06725e`
- `git hash-object` both times: `1d5f045c130cd0ed6b1316787f66be151a8e74a9`
- `git diff HEAD -- "11 Agentic Refactoring/exercise-02-strangler-pattern-checkout/checkout-strangler-app/src/checkout/legacyCheckout.mjs"`: empty

`checkoutRouter.mjs` was not in the protected set and was not restored.

### After restore

`git diff HEAD`: empty (exit 0). Tracked porcelain empty.

`npm run verify:exercise` after restore: exit code **0**. Same PASS lines and Source SHA `58878e4215a164c7a445bd4399118625e894d5e3`.

After verify, `git diff HEAD` still empty. Tracked porcelain still empty. Full porcelain still only:

```
?? "11 Agentic Refactoring/exercise-02-strangler-pattern-checkout/evidence/"
```

The result does not depend on a modified protected input.

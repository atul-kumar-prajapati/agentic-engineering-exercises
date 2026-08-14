# Specialist Prompts

Use one fresh agent session per role. Give every agent the same baseline SHA and forbid application edits.

## Security

Inspect untrusted note rendering and the approval service boundary. Run `npm run review:security`. Report exploitable paths, direct service reproductions, and the smallest safe boundary fix.

## Accessibility

Inspect the queue selection workflow using keyboard-native semantics. Run `npm run review:accessibility`. Report the blocked interaction and keyboard evidence.

## Performance

Inspect portfolio-risk complexity and repeated render work. Run the baseline measurement and `npm run review:performance`. Report comparable inputs, timings, calculation correctness, and the required reduction.

## Testability

Inspect whether approval success and failure can be tested deterministically without browser globals or real waits. Run `npm run review:testability`. Report the boundary that prevents reliable tests.

Every report uses the shared template. A specialist reports findings only; the integration owner owns decisions and code changes.

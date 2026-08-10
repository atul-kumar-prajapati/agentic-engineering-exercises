# Migration Phases

1. Inventory: component boundary, props, states, accessibility, and owner.
2. Characterize: add tests for visible behavior and known oddities.
3. Convert: move to typed React without changing public behavior.
4. Verify: typecheck, tests, build, and review note.
5. Refine: update the skill when a missed case appears.

Stop when the next change touches shared foundations, public API shape, routing, or global styling without explicit ownership.


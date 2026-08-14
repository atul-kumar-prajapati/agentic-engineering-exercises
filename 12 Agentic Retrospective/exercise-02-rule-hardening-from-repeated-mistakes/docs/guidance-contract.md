# Guidance Contract

`AGENTS.md` is safe-start routing, not a persistence manual. It must stay at or below 1,200 characters, tell agents when to read `.agent/persistence.md`, and name `npm run test:persistence`. Do not duplicate display-label, canonical-value, or clock details there.

`.agent/persistence.md` must state:

- durable identity uses stable IDs; display labels remain presentation-only;
- stored enum-like values are trimmed canonical lowercase;
- business builders use a caller-provided clock, not `Date.now` or `new Date`;
- exceptions require an explicit product contract and focused test;
- `npm run test:persistence` is the verification command.

These rules apply when writing durable filters, settings, or preferences. They do not prohibit labels in UI rendering, human-readable exports, or logs.

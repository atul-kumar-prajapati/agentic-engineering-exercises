# Review Boundaries

Review these risk areas in `review-base..review-head`:

- Data origin and rendering context for every HTML sink.
- Native keyboard and focus behavior of interactive queue rows.
- Client validation removed or weakened by the patch.
- Server authorization and state-transition rules.
- Tests missing for each confirmed behavior regression.

Severity must follow impact, not scanner severity. A static warning is not automatically exploitable, and a clean scanner result does not prove behavioral correctness.

# Repository Rules

Keep public adapter behavior backward compatible. Do not rename exported functions or alter error messages without an approved contract change.

Run the adapter unit tests and the full typecheck before completion. Add a regression test for every corrected edge case. Keep the diff limited to the session adapter and its tests.

Never copy secrets or production session values into evidence. Treat legacy migration notes as historical background, not current authority.

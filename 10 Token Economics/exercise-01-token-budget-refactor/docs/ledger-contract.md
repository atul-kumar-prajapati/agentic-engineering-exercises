# Context Evidence Contract

Commit `evidence/context-plan.json` before editing the selector. It contains `schemaVersion: 1`, task tags, question tags, the open questions they represent, maximum bytes, mandatory IDs, and expected selected IDs. `context-plan.md` explains the same choices in plain language. Record that commit SHA later as `planSha` in the ledger.

After implementation, run the selector for that exact task and write its unmodified result plus `sourceSha` to `evidence/context-ledger.json`. Every catalog source must appear once in either `selected` or `skipped`, with exact bytes and a reason.

Use one focused source commit containing only `selectContext.mjs`, `adaptSession.mjs`, and their two learner test files. Later commits may add evidence only. `decision.md` must compare planned and actual context, explain any expansion, and state the correctness and cost trade-off.

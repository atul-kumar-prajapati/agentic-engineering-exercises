# Local Evaluation Contract

Run each protected case once without the skill and once with the skill in a new session. Use the same agent, model, tools, permissions, prompt, and time limit. Do not retry or correct a response.

Create an adapter that reads the prompt from standard input and writes one JSON object to standard output. The object must contain `runNonce`, a unique session ID, merge decision, and findings. Run it only through:

```text
npm run eval:run -- --lane <before|after> --case <case-id> --agent <name> --model <name> --tools <description> --permissions <description> --time-limit <minutes> --adapter <path>
```

The runner writes `evidence/runs/<lane>/<case-id>.json` and records:

- `schemaVersion: 3`, lane, case ID, session ID, agent, model, start time, duration, command result, nonce, and actual Git source SHA.
- SHA-256 of the protected runner, adapter, canonical prompt, diff, transcript, and skill when used.
- Transcript path relative to `evidence/`.
- Merge decision and a `findings` array.

Each finding contains an arbitrary unique `id`, severity, changed file, an exact added-line code anchor, the acceptance rule it evaluates, observed behavior, impact, reproduction, recommendation, and `blocking`. The nonce-bound adapter response must exactly match the stored run. Reusing published IDs or merely reaching a target count is not part of scoring.

The local scorer requires every violated acceptance rule to be covered by a distinct blocker, at least 80 percent precision, no blocker on the conforming control, and no metric more than five percentage points below the baseline. It reconstructs the canonical prompt, validates exact anchors and adapter provenance, and derives the decision from runner-produced files; it never calls a model.

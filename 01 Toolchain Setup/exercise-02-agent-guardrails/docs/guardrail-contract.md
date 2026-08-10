# Guardrail Contract

The exercise supports any coding agent that can run an executable check before a tool action.

## Policy and Enforcement

Create `guardrails/policy.json` with the rules used by your enforcement code.

The policy must contain:

```text
version
defaultDecision
allowedOperations
allowedPaths
blockedPaths
approvalPaths
blockedCommands
approvalCommands
blockedPromptPatterns
```

Use glob patterns for paths and regular-expression strings for commands and prompts. `defaultDecision` must be `blocked`.

Create `guardrails/enforce.mjs` and export:

```js
evaluateAction(policy, action)
createAuditRecord(action, result)
```

`evaluateAction` must return an object with `decision` and `reason`. The decision must be `allowed`, `blocked`, or `approval-required`.

An action can contain `operation`, `path`, `command`, `prompt`, and `symlinkTarget`. Treat all action values as untrusted input.

`createAuditRecord` must return a safe record of the attempted action, decision, and reason. It must not include file contents, prompts, canary values, or secrets.

## Selected-Agent Adapter

Create one `.mjs` file under `guardrails/adapters/` and export:

```js
agentName
instructionFiles
configurationFiles
evaluateAction(policy, action)
```

`instructionFiles` and `configurationFiles` must contain repository-relative paths to the native files used by the selected agent. The native configuration must invoke the adapter or shared enforcement code before tool execution.

The adapter's `evaluateAction` must return the same result as the shared enforcement code. It may also contain the input and output conversion required by the selected agent.

## Verification

The supplied tests exercise allowed, blocked, approval-required, bypass, prompt-injection, audit-redaction, native-configuration, and weakened-policy cases.

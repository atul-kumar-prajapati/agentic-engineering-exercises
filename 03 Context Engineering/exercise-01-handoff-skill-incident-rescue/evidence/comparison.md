# Before and After Comparison

## Fair conditions

Both implementation runs were first attempts by fresh Codex agents using the same inherited model, workspace inspection/editing tools, PowerShell execution, workspace-write permission profile, exact incident request, and 30-minute time limit. Neither run was repeated to obtain a preferred result. Both worked on the same restored starter source; the baseline patch was captured and then reversed before preparation. The only intended variable was context: the baseline received the raw session history, while the final agent received only the generated 546-word Handoff output. The baseline performed the one-time dependency installation, so the final run began with dependencies present; this affected command startup noise but not source requirements, tools, permissions, or acceptance checks.

## Requirement selection

The baseline agent had to distrust and cross-check the raw history itself. It found the approved policy and correctly rejected the draft 24-hour boundary, Incident Desk reassignment, false persistence claim, and unrelated permission error. The handoff carried those verified decisions with authority labels and explicit exclusions, so the final agent went directly to the approved 48-hour boundary and current API contract without consuming the unreliable session.

Both implementations reached the correct functional result. The demonstrated improvement is therefore not a fabricated pass/fail contrast: it is a cleaner decision path, bounded context, and a smaller patch. The final agent retained the starter's explanatory comments, whereas the baseline removed them along with the bad constant. `before.patch` and `after.patch` show this difference.

## Protected behavior and implementation

Both runs preserved owner data, manual escalation behavior, scoring, filtering, public API names, and defensive copies. The handoff made these protections explicit before editing and named the exact remaining changes. The final agent reported only three semantic edits across `escalationPolicy.ts` and `workflowApi.ts`: threshold, owner override, and saved queue assignment. It made no detour into scoring or UI code and did not inspect baseline evidence or raw history.

## Verification

The baseline ultimately passed the 10 incident regressions and the agent gate, but its trace included PowerShell launcher failures, missing-dependency failures, a sandbox cache error, installation, and retries. The final run executed the handoff's Windows-safe commands directly and passed `npm run test:incident`, typecheck, and `npm run agent:check` on the first project execution. Because dependencies were already installed, this comparison supports reduced context and verification noise rather than claiming the handoff alone caused faster package setup.

The coordinator then ran `npm run test:handoff` after assembling all evidence. Final command outputs are recorded in `evidence/after.md`.

## Context influence

The final 571-word handoff replaced the long mixed-quality history with five things the next agent needed: authoritative requirements, accurate starter state, remaining work, protected behavior, and verification commands. It excluded superseded instructions and unsupported completion claims while retaining paths for independent verification. That boundary let the final agent complete the fix without inheriting the earlier session's assumptions or receiving extra explanation.
